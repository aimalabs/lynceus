#!/usr/bin/env python3
"""
Split a large model file into fixed-size chunks (e.g. 30MB) for GitHub and web streaming.
Generates .part0, .part1, ... .partN and an accompanying manifest.json.
"""

import os
import sys
import json
import hashlib

def split_file(input_path: str, output_dir: str, chunk_size_mb: int = None, num_chunks: int = None):
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input file not found: {input_path}")

    os.makedirs(output_dir, exist_ok=True)
    file_name = os.path.basename(input_path)

    with open(input_path, 'rb') as f:
        data = f.read()

    total_bytes = len(data)
    sha256_hash = hashlib.sha256(data).hexdigest()

    if num_chunks is not None and num_chunks > 0:
        actual_num_chunks = num_chunks
        chunk_bytes = (total_bytes + actual_num_chunks - 1) // actual_num_chunks
    elif chunk_size_mb is not None and chunk_size_mb > 0:
        chunk_bytes = chunk_size_mb * 1024 * 1024
        actual_num_chunks = (total_bytes + chunk_bytes - 1) // chunk_bytes
    else:
        chunk_bytes = 30 * 1024 * 1024
        actual_num_chunks = (total_bytes + chunk_bytes - 1) // chunk_bytes

    print(f"[Splitter] Splitting '{file_name}' ({total_bytes / (1024*1024):.2f} MB)")
    print(f"[Splitter] SHA-256: {sha256_hash}")
    print(f"[Splitter] Target chunks: {actual_num_chunks} (approx {chunk_bytes / (1024*1024):.2f} MB/chunk)")

    chunk_files = []
    for i in range(actual_num_chunks):
        start = i * chunk_bytes
        end = min(start + chunk_bytes, total_bytes)
        chunk_data = data[start:end]
        
        part_name = f"{file_name}.part{i}"
        part_path = os.path.join(output_dir, part_name)
        with open(part_path, 'wb') as pf:
            pf.write(chunk_data)
        
        chunk_files.append({
            "index": i,
            "fileName": part_name,
            "bytes": len(chunk_data),
            "sha256": hashlib.sha256(chunk_data).hexdigest()
        })
        print(f"  ✓ Written chunk {i}/{actual_num_chunks-1}: {part_name} ({len(chunk_data) / (1024*1024):.2f} MB)")

    manifest = {
        "modelName": file_name,
        "totalBytes": total_bytes,
        "totalSizeMB": round(total_bytes / (1024*1024), 2),
        "chunkSizeBytes": chunk_bytes,
        "numChunks": actual_num_chunks,
        "sha256": sha256_hash,
        "chunks": chunk_files
    }

    manifest_path = os.path.join(output_dir, f"{file_name}.manifest.json")
    with open(manifest_path, 'w') as mf:
        json.dump(manifest, mf, indent=2)

    print(f"[Splitter] ✓ Manifest written to: {manifest_path}")
    return manifest

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description="Split ONNX model into chunks with manifest")
    parser.add_argument("src", nargs="?", default="web/swin_classifier.onnx", help="Source ONNX model")
    parser.add_argument("dst", nargs="?", default="assets", help="Destination directory")
    parser.add_argument("--chunks", type=int, default=10, help="Fixed number of chunks (default: 10)")
    parser.add_argument("--chunk-size-mb", type=int, default=None, help="Target chunk size in MB")
    args = parser.parse_args()

    split_file(args.src, args.dst, chunk_size_mb=args.chunk_size_mb, num_chunks=args.chunks)
