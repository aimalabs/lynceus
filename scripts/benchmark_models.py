import os
import time
import numpy as np
from PIL import Image
import onnxruntime as ort

def run_cellpose_inference(model_path, image_path, scale=0.50):
    img = Image.open(image_path)
    W_orig, H_orig = img.size
    W_proc = int(round((W_orig * scale) / 8) * 8)
    H_proc = int(round((H_orig * scale) / 8) * 8)

    img_resized = img.resize((W_proc, H_proc), Image.Resampling.BILINEAR)
    arr = np.array(img_resized).astype(np.float32)

    # Luminance grayscale & invert
    gray = 255.0 - (0.299 * arr[:,:,0] + 0.587 * arr[:,:,1] + 0.114 * arr[:,:,2])
    p1 = np.percentile(gray, 1.0)
    p99 = np.percentile(gray, 99.0)
    norm_ch0 = np.clip((gray - p1) / max(1e-5, p99 - p1), 0.0, 1.0)
    norm_ch1 = np.zeros_like(norm_ch0)
    tensor_in = np.stack([norm_ch0, norm_ch1], axis=0)[np.newaxis, ...].astype(np.float32)

    t0 = time.time()
    sess = ort.InferenceSession(model_path, providers=['CPUExecutionProvider'])
    load_time = time.time() - t0

    t1 = time.time()
    out = sess.run(None, {'input': tensor_in})[0][0]
    infer_time = time.time() - t1

    dP_y = out[0]
    dP_x = out[1]
    cellprob = out[2]

    # Active pixels
    active_mask = cellprob > 0.0
    active_y, active_x = np.where(active_mask)

    # Euler integration
    pt_y = active_y.astype(np.float32).copy()
    pt_x = active_x.astype(np.float32).copy()

    for _ in range(200):
        ix = np.clip(np.round(pt_x).astype(int), 0, W_proc - 1)
        iy = np.clip(np.round(pt_y).astype(int), 0, H_proc - 1)
        pt_x = np.clip(pt_x + dP_x[iy, ix] * 0.2, 0, W_proc - 1)
        pt_y = np.clip(pt_y + dP_y[iy, ix] * 0.2, 0, H_proc - 1)

    final_y = np.round(pt_y).astype(int)
    final_x = np.round(pt_x).astype(int)
    hist, _, _ = np.histogram2d(final_y, final_x, bins=[H_proc, W_proc], range=[[0, H_proc], [0, W_proc]])

    peaks_y, peaks_x = np.where(hist >= 5)

    return {
        'model': os.path.basename(model_path),
        'size_mb': os.path.getsize(model_path) / (1024 * 1024),
        'load_time_s': load_time,
        'infer_time_s': infer_time,
        'active_pixels': len(active_y),
        'detected_sinks': len(peaks_y),
        'prob_max': float(cellprob.max()),
        'prob_min': float(cellprob.min())
    }

if __name__ == '__main__':
    img_path = 'web/smear-02.jpg'
    models = [
        'web/cellpose_cyto3_unet_int8.onnx',
        'web/cellpose_cpsam_v2_int8.onnx'
    ]

    print(f"{'Model':<35} | {'Size':<8} | {'Infer Time':<10} | {'Active Px':<10} | {'Sinks':<8}")
    print("-" * 80)
    for m in models:
        if os.path.exists(m):
            res = run_cellpose_inference(m, img_path, scale=0.50)
            print(f"{res['model']:<35} | {res['size_mb']:>6.1f}MB | {res['infer_time_s']*1000:>8.1f}ms | {res['active_pixels']:>10} | {res['detected_sinks']:>8}")
