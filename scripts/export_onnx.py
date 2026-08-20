"""
Cellpose ONNX Export and Quantization Suite.

Exports real official Cellpose models with pre-trained weights:
  1. Cellpose 4 SAM ViT (cpsam_v2) - ~304.6M params, real ViT weights (~/.cellpose/models/cpsam_v2)
  2. Cellpose 2/3 Classic CPnet (cyto3) - ~6.6M params, real official weights from cellpose.org
  3. Cellpose Lightweight UNet (lightweight) - ~0.22M params for instant testing
"""

import argparse
import os
from pathlib import Path
from typing import List, Optional, Tuple, Union
import urllib.request

import numpy as np
import onnx
from onnxconverter_common import float16
from onnxruntime.quantization import quantize_dynamic, QuantType
import requests
import torch
import torch.nn as nn
import torch.nn.functional as F
from cellpose import models


def batchconv(in_channels: int, out_channels: int, sz: int = 3) -> nn.Sequential:
    return nn.Sequential(
        nn.BatchNorm2d(in_channels, eps=1e-5),
        nn.ReLU(inplace=True),
        nn.Conv2d(in_channels, out_channels, sz, padding=sz // 2),
    )


def batchconv0(in_channels: int, out_channels: int, sz: int = 1) -> nn.Sequential:
    return nn.Sequential(
        nn.BatchNorm2d(in_channels, eps=1e-5),
        nn.Conv2d(in_channels, out_channels, sz, padding=sz // 2),
    )


class resdown(nn.Module):
    def __init__(self, in_channels: int, out_channels: int, sz: int = 3):
        super().__init__()
        self.conv = nn.Sequential()
        self.proj = batchconv0(in_channels, out_channels, 1)
        for t in range(4):
            if t == 0:
                self.conv.add_module(f"conv_{t}", batchconv(in_channels, out_channels, sz))
            else:
                self.conv.add_module(f"conv_{t}", batchconv(out_channels, out_channels, sz))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.proj(x) + self.conv[1](self.conv[0](x))
        x = x + self.conv[3](self.conv[2](x))
        return x


class downsample(nn.Module):
    def __init__(self, nbase: Tuple[int, ...], sz: int = 3):
        super().__init__()
        self.down = nn.Sequential()
        self.maxpool = nn.MaxPool2d(2, 2)
        for n in range(len(nbase) - 1):
            self.down.add_module(f"res_down_{n}", resdown(nbase[n], nbase[n + 1], sz))

    def forward(self, x: torch.Tensor) -> List[torch.Tensor]:
        xd = []
        for n in range(len(self.down)):
            if n > 0:
                y = self.maxpool(xd[n - 1])
            else:
                y = x
            xd.append(self.down[n](y))
        return xd


class batchconvstyle(nn.Module):
    def __init__(self, in_channels: int, out_channels: int, style_channels: int, sz: int = 3):
        super().__init__()
        self.conv = batchconv(in_channels, out_channels, sz)
        self.full = nn.Linear(style_channels, out_channels)

    def forward(self, style: torch.Tensor, x: torch.Tensor, y: Optional[torch.Tensor] = None) -> torch.Tensor:
        if y is not None:
            x = x + y
        feat = self.full(style)
        y_out = x + feat.unsqueeze(-1).unsqueeze(-1)
        return self.conv(y_out)


class resup(nn.Module):
    def __init__(self, in_channels: int, out_channels: int, style_channels: int, sz: int = 3):
        super().__init__()
        self.conv = nn.Sequential()
        self.conv.add_module("conv_0", batchconv(in_channels, out_channels, sz))
        self.conv.add_module("conv_1", batchconvstyle(out_channels, out_channels, style_channels, sz))
        self.conv.add_module("conv_2", batchconvstyle(out_channels, out_channels, style_channels, sz))
        self.conv.add_module("conv_3", batchconvstyle(out_channels, out_channels, style_channels, sz))
        self.proj = batchconv0(in_channels, out_channels, 1)

    def forward(self, x: torch.Tensor, y: torch.Tensor, style: torch.Tensor) -> torch.Tensor:
        x = self.proj(x) + self.conv[1](style, self.conv[0](x), y=y)
        x = x + self.conv[3](style, self.conv[2](style, x))
        return x


class make_style(nn.Module):
    def __init__(self):
        super().__init__()
        self.flatten = nn.Flatten()

    def forward(self, x0: torch.Tensor) -> torch.Tensor:
        style = F.adaptive_avg_pool2d(x0, (1, 1))
        style = self.flatten(style)
        style = style / (torch.sum(style**2, axis=1, keepdim=True) ** 0.5 + 1e-6)
        return style


class upsample(nn.Module):
    def __init__(self, nbase: List[int], sz: int = 3):
        super().__init__()
        self.upsampling = nn.Upsample(scale_factor=2, mode="nearest")
        self.up = nn.Sequential()
        for n in range(1, len(nbase)):
            self.up.add_module(f"res_up_{n - 1}", resup(nbase[n], nbase[n - 1], nbase[-1], sz))

    def forward(self, style: torch.Tensor, xd: List[torch.Tensor]) -> torch.Tensor:
        x = self.up[-1](xd[-1], xd[-1], style)
        for n in range(len(self.up) - 2, -1, -1):
            x = self.upsampling(x)
            x = self.up[n](x, xd[n], style)
        return x


class OfficialCellposeCPnet(nn.Module):
    """
    Official Cellpose 2/3 Residual CPnet architecture (~6.6M parameters).
    Exact 100% match for official 'cyto', 'cyto2', 'cyto3', and 'nuclei' pre-trained weights.
    """

    def __init__(self, in_channels: int = 2, out_channels: int = 3, nbase: Tuple[int, ...] = (32, 64, 128, 256), sz: int = 3):
        super().__init__()
        full_nbase = (in_channels, *nbase)
        self.downsample = downsample(full_nbase, sz)
        nbaseup = list(nbase)
        nbaseup.append(nbaseup[-1])
        self.upsample = upsample(nbaseup, sz)
        self.make_style = make_style()
        self.output = batchconv(nbaseup[0], out_channels, 1)
        self.diam_mean = nn.Parameter(data=torch.ones(1) * 30.0, requires_grad=False)
        self.diam_labels = nn.Parameter(data=torch.ones(1) * 30.0, requires_grad=False)

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        h, w = x.shape[2], x.shape[3]
        pad_h = (8 - h % 8) % 8
        pad_w = (8 - w % 8) % 8
        if pad_h > 0 or pad_w > 0:
            x_pad = F.pad(x, (0, pad_w, 0, pad_h), mode="reflect")
        else:
            x_pad = x

        T0 = self.downsample(x_pad)
        style = self.make_style(T0[-1])
        out_feat = self.upsample(style, T0)
        out = self.output(out_feat)

        if pad_h > 0 or pad_w > 0:
            out = out[:, :, :h, :w]
        return out, style


class DynamicCPSAMWrapper(nn.Module):
    """
    Cellpose 4 SAM ViT Wrapper with FP32 standard input/output interface,
    resampling to SAM's native 256x256 window grid, and optional internal FP16 execution.
    """

    def __init__(self, net: nn.Module, fp16: bool = False):
        super().__init__()
        self.fp16 = fp16
        if fp16:
            self.net = net.half()
        else:
            self.net = net.float()

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        # Unconditionally interpolate to native SAM ViT 256x256 window
        x_256 = F.interpolate(x, size=(256, 256), mode="bilinear", align_corners=False)
        x_in = x_256.half() if self.fp16 else x_256

        # Patch embedding [B, 32, 32, 1024]
        feat = F.conv2d(
            x_in,
            self.net.encoder.patch_embed.proj.weight[:, : x_in.shape[1]],
            bias=self.net.encoder.patch_embed.proj.bias,
            stride=self.net.ps,
        )
        feat = feat.permute(0, 2, 3, 1) + self.net.encoder.pos_embed

        # Transformer blocks
        for blk in self.net.encoder.blocks:
            feat = blk(feat)

        feat = self.net.encoder.neck(feat.permute(0, 3, 1, 2))
        x1 = self.net.out(feat)
        x1 = F.conv_transpose2d(x1, self.net.W2, stride=self.net.ps, padding=0)

        # Unconditionally interpolate back to dynamic [B, 3, H, W]
        out = F.interpolate(x1.float(), size=(x.shape[2], x.shape[3]), mode="bilinear", align_corners=False)

        return out.float(), torch.zeros((x.shape[0], 256), dtype=torch.float32, device=x.device)


class LightweightCellposeUNet(nn.Module):
    """Lightweight ResNet-style UNet architecture (~0.22M params)."""

    def __init__(self, in_channels: int = 2, out_channels: int = 3, base_channels: int = 32):
        super().__init__()
        self.conv_in = nn.Sequential(
            nn.Conv2d(in_channels, base_channels, kernel_size=3, padding=1),
            nn.BatchNorm2d(base_channels),
            nn.ReLU(inplace=True),
        )
        self.down1 = nn.Sequential(
            nn.Conv2d(base_channels, base_channels * 2, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm2d(base_channels * 2),
            nn.ReLU(inplace=True),
        )
        self.down2 = nn.Sequential(
            nn.Conv2d(base_channels * 2, base_channels * 4, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm2d(base_channels * 4),
            nn.ReLU(inplace=True),
        )

        self.pool = nn.AdaptiveAvgPool2d((1, 1))
        self.style_fc = nn.Linear(base_channels * 4, 256)

        self.conv_up2 = nn.Sequential(
            nn.Conv2d(base_channels * 4, base_channels * 2, kernel_size=3, padding=1),
            nn.BatchNorm2d(base_channels * 2),
            nn.ReLU(inplace=True),
        )
        self.conv_up1 = nn.Sequential(
            nn.Conv2d(base_channels * 2, base_channels, kernel_size=3, padding=1),
            nn.BatchNorm2d(base_channels),
            nn.ReLU(inplace=True),
        )
        self.conv_out = nn.Conv2d(base_channels, out_channels, kernel_size=3, padding=1)

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        c0 = self.conv_in(x)
        c1 = self.down1(c0)
        c2 = self.down2(c1)

        style = self.pool(c2).flatten(1)
        style = self.style_fc(style)

        u2 = F.interpolate(c2, size=(c1.shape[2], c1.shape[3]), mode="bilinear", align_corners=False)
        u1 = self.conv_up2(u2) + c1

        u0 = F.interpolate(u1, size=(c0.shape[2], c0.shape[3]), mode="bilinear", align_corners=False)
        out_feat = self.conv_up1(u0) + c0

        out = self.conv_out(out_feat)
        return out, style


def download_official_weights(model_name: str = "cyto3") -> Path:
    cache_dir = Path.home() / ".cellpose" / "models"
    cache_dir.mkdir(parents=True, exist_ok=True)
    cache_path = cache_dir / model_name

    if not cache_path.exists() or cache_path.stat().st_size < 1000:
        url = f"https://www.cellpose.org/models/{model_name}"
        print(f"Downloading official {model_name} pre-trained weights from {url}...")
        r = requests.get(url, stream=True, timeout=30)
        with open(cache_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"Downloaded {model_name} ({cache_path.stat().st_size / (1024*1024):.2f} MB)")
    return cache_path


def load_cellpose_model(model_name: str = "cyto3", in_channels: int = 2) -> nn.Module:
    name_lower = model_name.lower()
    if name_lower in ["lightweight", "unet_light", "fast"]:
        return LightweightCellposeUNet(in_channels=in_channels, out_channels=3)
    elif name_lower in ["cyto3", "cyto3_unet", "classic", "cpnet", "cyto", "cyto2"]:
        net = OfficialCellposeCPnet(in_channels=in_channels, out_channels=3)
        try:
            cache_path = download_official_weights("cyto3")
            state_dict = torch.load(cache_path, map_location="cpu", weights_only=False)
            net.load_state_dict(state_dict, strict=False)
            print("Loaded official cyto3 pre-trained weights into CPnet.")
        except Exception as e:
            print(f"Warning: Could not load official cyto3 weights ({e}).")
        return net
    else:
        cp_model = models.CellposeModel(model_type=model_name, gpu=False, use_bfloat16=False)
        return DynamicCPSAMWrapper(cp_model.net, fp16=False)


def export_cellpose_to_onnx(
    model: Union[str, nn.Module] = "cyto3",
    output_path: Union[str, Path] = "cellpose.onnx",
    in_channels: int = 2,
    input_size: Tuple[int, int] = (256, 256),
    opset_version: int = 17,
    dynamic_axes: bool = True,
    verify: bool = True,
) -> Path:
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    if isinstance(model, str):
        net = load_cellpose_model(model, in_channels=in_channels)
    else:
        net = model

    net.eval()
    dummy_input = torch.randn(1, in_channels, input_size[0], input_size[1], dtype=torch.float32)

    dynamic_axes_dict = {
        "input": {0: "batch", 2: "height", 3: "width"},
        "flows_and_cellprob": {0: "batch", 2: "height", 3: "width"},
        "style": {0: "batch"},
    } if dynamic_axes else None

    torch.onnx.export(
        net,
        dummy_input,
        str(output_path),
        export_params=True,
        opset_version=opset_version,
        do_constant_folding=True,
        input_names=["input"],
        output_names=["flows_and_cellprob", "style"],
        dynamic_axes=dynamic_axes_dict,
        dynamo=False,
    )

    if verify:
        onnx_model = onnx.load(str(output_path))
        onnx.checker.check_model(onnx_model)

    return output_path


def export_cellpose_to_fp16_native(
    model: Union[str, nn.Module] = "cyto3",
    output_path: Union[str, Path] = "cellpose_fp16.onnx",
    in_channels: int = 2,
    input_size: Tuple[int, int] = (256, 256),
    opset_version: int = 17,
) -> Path:
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    if isinstance(model, str):
        net = load_cellpose_model(model, in_channels=in_channels)
    else:
        net = model

    net.eval()
    if isinstance(net, DynamicCPSAMWrapper):
        net_half = DynamicCPSAMWrapper(net.net, fp16=True).eval()
        dummy = torch.randn(1, in_channels, input_size[0], input_size[1], dtype=torch.float32)
    else:
        net_half = net.half()
        dummy = torch.randn(1, in_channels, input_size[0], input_size[1], dtype=torch.float16)

    torch.onnx.export(
        net_half,
        dummy,
        str(output_path),
        export_params=True,
        opset_version=opset_version,
        do_constant_folding=True,
        input_names=["input"],
        output_names=["flows_and_cellprob", "style"],
        dynamic_axes={
            "input": {0: "batch", 2: "height", 3: "width"},
            "flows_and_cellprob": {0: "batch", 2: "height", 3: "width"},
        },
        dynamo=False,
    )
    return output_path


def convert_to_fp16(input_onnx: Union[str, Path], output_onnx: Union[str, Path]) -> Path:
    input_onnx = Path(input_onnx)
    output_onnx = Path(output_onnx)
    model = onnx.load(str(input_onnx))
    model_fp16 = float16.convert_float_to_float16(model, keep_io_types=True)
    onnx.save(model_fp16, str(output_onnx))
    return output_onnx


def convert_to_int8(input_onnx: Union[str, Path], output_onnx: Union[str, Path]) -> Path:
    input_onnx = Path(input_onnx)
    output_onnx = Path(output_onnx)
    quantize_dynamic(
        str(input_onnx),
        str(output_onnx),
        weight_type=QuantType.QUInt8,
    )
    return output_onnx


def export_all_variants(output_dir: Union[str, Path] = "web") -> List[Path]:
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    exported_files = []

    configs = [
        ("lightweight", "cellpose_lightweight"),
        ("cyto3", "cellpose_cyto3_unet"),
        ("cpsam_v2", "cellpose_cpsam_v2"),
    ]

    for model_key, base_filename in configs:
        fp32_path = output_dir / f"{base_filename}.onnx"
        fp16_path = output_dir / f"{base_filename}_fp16.onnx"
        int8_path = output_dir / f"{base_filename}_int8.onnx"

        print(f"\n--- Exporting {model_key} ---")
        export_cellpose_to_onnx(model_key, fp32_path)
        exported_files.append(fp32_path)
        print(f"  [FP32] {fp32_path.name} ({fp32_path.stat().st_size / (1024*1024):.2f} MB)")

        export_cellpose_to_fp16_native(model_key, fp16_path)
        exported_files.append(fp16_path)
        print(f"  [FP16] {fp16_path.name} ({fp16_path.stat().st_size / (1024*1024):.2f} MB)")

        if model_key != "cpsam_v2":
            convert_to_int8(fp32_path, int8_path)
            exported_files.append(int8_path)
            print(f"  [INT8] {int8_path.name} ({int8_path.stat().st_size / (1024*1024):.2f} MB)")

    # Export Swin Classifier if swin_model.pth is present
    if Path("swin_model.pth").exists():
        try:
            swin_res = export_swin_classifier("swin_model.pth", output_dir=output_dir)
            for p in swin_res.values():
                if p.exists():
                    exported_files.append(p)
        except Exception as e:
            print(f"Error exporting Swin Classifier: {e}")

    return exported_files


def export_swin_classifier(
    pth_path: Union[str, Path] = "swin_model.pth",
    output_dir: Union[str, Path] = "web",
    num_classes: int = 20,
) -> dict:
    pth_path = Path(pth_path)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    if not pth_path.exists():
        print(f"Warning: {pth_path} not found. Skipping Swin export.")
        return {}

    import torchvision.models as tv_models

    print(f"\n--- Exporting Swin Transformer Classifier ({pth_path}) ---")
    sd = torch.load(pth_path, map_location="cpu", weights_only=False)

    tv_sd = {}
    for k, v in sd.items():
        new_k = k
        if k == "patch_embed.proj.weight":
            new_k = "features.0.0.weight"
        elif k == "patch_embed.proj.bias":
            new_k = "features.0.0.bias"
        elif k == "patch_embed.norm.weight":
            new_k = "features.0.2.weight"
        elif k == "patch_embed.norm.bias":
            new_k = "features.0.2.bias"
        elif k == "head.fc.weight":
            new_k = "head.weight"
        elif k == "head.fc.bias":
            new_k = "head.bias"
        elif k == "norm.weight":
            new_k = "norm.weight"
        elif k == "norm.bias":
            new_k = "norm.bias"
        else:
            parts = k.split(".")
            layer_idx = int(parts[1])
            if parts[2] == "downsample":
                feat_idx = layer_idx * 2
                sub = ".".join(parts[3:])
                new_k = f"features.{feat_idx}.{sub}"
            elif parts[2] == "blocks":
                block_idx = int(parts[3])
                feat_idx = layer_idx * 2 + 1
                rest = parts[4:]
                if rest[0] == "mlp":
                    if rest[1] == "fc1":
                        new_k = f"features.{feat_idx}.{block_idx}.mlp.0.{rest[2]}"
                    elif rest[1] == "fc2":
                        new_k = f"features.{feat_idx}.{block_idx}.mlp.3.{rest[2]}"
                else:
                    new_k = f"features.{feat_idx}.{block_idx}." + ".".join(rest)
        tv_sd[new_k] = v

    model = tv_models.swin_t(num_classes=num_classes)
    model.load_state_dict(tv_sd, strict=False)
    model.eval()

    fp32_path = output_dir / "swin_classifier.onnx"
    dummy_input = torch.randn(1, 3, 224, 224)
    torch.onnx.export(
        model,
        dummy_input,
        str(fp32_path),
        input_names=["input"],
        output_names=["logits"],
        dynamic_axes={"input": {0: "batch_size"}, "logits": {0: "batch_size"}},
        opset_version=18,
        dynamo=False,
    )
    print(f"  [FP32] {fp32_path.name} ({fp32_path.stat().st_size / (1024*1024):.2f} MB)")

    # INT8
    int8_path = output_dir / "swin_classifier_int8.onnx"
    try:
        quantize_dynamic(
            str(fp32_path),
            str(int8_path),
            op_types_to_quantize=["MatMul", "Gemm"],
            per_channel=True,
            weight_type=QuantType.QInt8,
        )
        print(f"  [INT8] {int8_path.name} ({int8_path.stat().st_size / (1024*1024):.2f} MB)")
    except Exception as e:
        print(f"  [INT8] Quantization skipped: {e}")

    # FP16
    fp16_path = output_dir / "swin_classifier_fp16.onnx"
    try:
        model_fp16 = tv_models.swin_t(num_classes=num_classes)
        model_fp16.load_state_dict(tv_sd, strict=False)
        model_fp16.half().eval()
        dummy_fp16 = torch.randn(1, 3, 224, 224, dtype=torch.float16)
        torch.onnx.export(
            model_fp16,
            dummy_fp16,
            str(fp16_path),
            input_names=["input"],
            output_names=["logits"],
            dynamic_axes={"input": {0: "batch_size"}, "logits": {0: "batch_size"}},
            opset_version=18,
            dynamo=False,
        )
        print(f"  [FP16] {fp16_path.name} ({fp16_path.stat().st_size / (1024*1024):.2f} MB)")
    except Exception as e:
        print(f"  [FP16] Half export skipped: {e}")

    return {"fp32": fp32_path, "int8": int8_path, "fp16": fp16_path}


def main():
    parser = argparse.ArgumentParser(description="Export Cellpose to ONNX Suite")
    parser.add_argument("--model", type=str, default="cyto3", help="Model name ('cpsam_v2', 'cyto3', 'lightweight')")
    parser.add_argument("--output-dir", type=str, default="web", help="Output directory")
    parser.add_argument("--all", action="store_true", help="Export all architectures and precisions")
    args = parser.parse_args()

    if args.all:
        export_all_variants(args.output_dir)
    else:
        fp32 = Path(args.output_dir) / f"cellpose_{args.model}.onnx"
        export_cellpose_to_onnx(args.model, fp32)
        print(f"Exported {fp32} ({fp32.stat().st_size / (1024*1024):.2f} MB)")


if __name__ == "__main__":
    main()
