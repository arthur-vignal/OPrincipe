"""
ascii_video.py — Converte um vídeo para arte ASCII em MP4.

Algoritmo:
1. ffmpeg extrai frames PNG em alta qualidade
2. Para cada frame: redimensiona pra ASCII grid, mapeia luminância -> char, renderiza texto com PIL
3. ffmpeg junta os frames PNG num MP4 com audio original

Uso:
  python ascii_video.py input.mp4 output.mp4 --cols 120 --charset detail
"""

import argparse
import os
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


# Paleta do-dark-to-light (10 chars)
PALETAS = {
    "simple": " .:-=+*#%@",
    # Paleta "toriumcoding-like" — mais detalhada, dark-to-light:
    "detail": ".'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
}


def find_font(size: int):
    """Tenta achar uma fonte mono disponível no sistema."""
    candidates = [
        "C:/Windows/Fonts/consola.ttf",
        "C:/Windows/Fonts/cour.ttf",
        "C:/Windows/Fonts/consolab.ttf",
        "/System/Library/Fonts/Menlo.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf",
    ]
    for p in candidates:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def frame_to_ascii_image(
    frame: Image.Image,
    cols: int,
    charset: str,
    font_size: int,
    bg=(0, 0, 0),
    fg=(255, 255, 255),
    colored: bool = True,
) -> Image.Image:
    """Converte um frame PIL em imagem ASCII renderizada."""
    # redimensiona mantendo aspect ratio, considera que chars são ~2x mais altos
    w, h = frame.size
    aspect = h / w
    char_aspect = 0.50  # típico de fonte mono
    rows = max(1, int(cols * aspect * char_aspect))
    # converte pra gray pra mapear char
    gray = frame.convert("L").resize((cols, rows))
    # converte pra RGB pequeno pra pegar cor por char
    small_rgb = frame.convert("RGB").resize((cols, rows))

    font = find_font(font_size)
    # medida do char (assume monospace)
    bbox = font.getbbox("M")
    char_w = bbox[2] - bbox[0]
    char_h = font_size  # usa o size direto pra espaçamento de linha

    img_w = cols * char_w
    img_h = rows * char_h
    out = Image.new("RGB", (img_w, img_h), bg)
    draw = ImageDraw.Draw(out)

    for y in range(rows):
        for x in range(cols):
            p = gray.getpixel((x, y))
            idx = min(int(p * (len(charset) - 1) / 255), len(charset) - 1)
            ch = charset[idx]
            if ch == " ":
                continue
            if colored:
                r, g, b = small_rgb.getpixel((x, y))
                # boost saturation slightly
                draw.text((x * char_w, y * char_h), ch, fill=(r, g, b), font=font)
            else:
                draw.text((x * char_w, y * char_h), ch, fill=fg, font=font)

    return out


def extract_frames(input_path: str, out_dir: str) -> int:
    """Extrai frames do vídeo via ffmpeg."""
    cmd = [
        "ffmpeg", "-y", "-i", input_path,
        "-vf", "fps=30,scale=trunc(iw/2)*2:trunc(ih/2)*2",
        "-q:v", "2",
        os.path.join(out_dir, "%06d.png"),
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    return len(list(Path(out_dir).glob("*.png")))


def encode_frames(frames_dir: str, output_path: str, fps: int = 30, with_audio: str | None = None) -> None:
    """Junta os frames PNG em MP4 via ffmpeg."""
    cmd = [
        "ffmpeg", "-y",
        "-framerate", str(fps),
        "-i", os.path.join(frames_dir, "%06d.png"),
    ]
    if with_audio:
        cmd.extend(["-i", with_audio])
    cmd.extend([
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-crf", "23",
        "-preset", "medium",
    ])
    if with_audio:
        cmd.extend(["-c:a", "aac", "-b:a", "128k"])
    cmd.append(output_path)
    subprocess.run(cmd, check=True, capture_output=True)


def extract_audio(input_path: str, output_path: str) -> None:
    """Extrai o audio do vídeo (sem re-encode)."""
    cmd = ["ffmpeg", "-y", "-i", input_path, "-vn", "-c:a", "copy", output_path]
    subprocess.run(cmd, capture_output=True)  # pode falhar se video não tem audio


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input", help="input video path")
    ap.add_argument("output", help="output mp4 path")
    ap.add_argument("--cols", type=int, default=140, help="ascii width in chars")
    ap.add_argument("--font-size", type=int, default=10, help="font size in px")
    ap.add_argument("--charset", default="detail", choices=list(PALETAS.keys()))
    ap.add_argument("--bw", action="store_true", help="black & white (no color)")
    ap.add_argument("--max-frames", type=int, default=None, help="limit frames (for testing)")
    ap.add_argument("--fps", type=int, default=30)
    args = ap.parse_args()

    if not os.path.exists(args.input):
        print(f"input not found: {args.input}", file=sys.stderr)
        sys.exit(1)

    charset = PALETAS[args.charset]
    colored = not args.bw

    with tempfile.TemporaryDirectory() as tmp:
        frames_dir = os.path.join(tmp, "frames")
        os.makedirs(frames_dir)

        print(f"Extracting frames from {args.input}...")
        n = extract_frames(args.input, frames_dir)
        print(f"  got {n} frames")

        if args.max_frames:
            n = min(n, args.max_frames)
            print(f"  limiting to {n} frames")

        audio_path = os.path.join(tmp, "audio.m4a")
        has_audio = False
        try:
            extract_audio(args.input, audio_path)
            if os.path.exists(audio_path) and os.path.getsize(audio_path) > 0:
                has_audio = True
        except Exception:
            pass

        out_frames_dir = os.path.join(tmp, "out_frames")
        os.makedirs(out_frames_dir)
        print(f"Rendering {n} ASCII frames (cols={args.cols}, font={args.font_size}px)...")
        for i in range(1, n + 1):
            src = os.path.join(frames_dir, f"{i:06d}.png")
            dst = os.path.join(out_frames_dir, f"{i:06d}.png")
            img = Image.open(src)
            out = frame_to_ascii_image(
                img, args.cols, charset, args.font_size, colored=colored
            )
            out.save(dst)
            if i % 20 == 0 or i == n:
                print(f"  {i}/{n}")

        print(f"Encoding to {args.output}...")
        encode_frames(
            out_frames_dir,
            args.output,
            fps=args.fps,
            with_audio=audio_path if has_audio else None,
        )
    print(f"Done: {args.output}")


if __name__ == "__main__":
    main()