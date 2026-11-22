#!/usr/bin/env python3
"""Build MILE's 60-second live-action welcome film from free Pexels footage."""
import pathlib
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[1]
MEDIA = ROOT / "public" / "media"
WORK = ROOT / ".mile-film-work"
MEDIA.mkdir(parents=True, exist_ok=True)
WORK.mkdir(parents=True, exist_ok=True)

# Each URL has been checked against its live Pexels video page.
SCENES = [
    ("https://www.pexels.com/video/focused-man-working-late-night-at-home-office-35331898/",
     "You have the skill. You have the ambition. You know there's more you can achieve. But sometimes, knowing your next step isn't easy."),
    ("https://www.pexels.com/video/man-working-late-at-home-desk-in-dim-room-35331905/",
     "You try different things. You improve your craft. You search for opportunities. Yet progress can feel uncertain when you don't have a clear direction."),
    ("https://www.pexels.com/video/a-man-typing-on-laptop-7546817/",
     "That's where MILE comes in. A place to understand your services, strengthen your strategy, explore your market and make more intentional moves."),
    ("https://www.pexels.com/video/businessmen-working-as-a-team-8425715/",
     "Because growth isn't just about working harder. It's about learning, connecting and becoming better with every step."),
    ("https://www.pexels.com/video/a-man-typing-on-laptop-while-writing-on-a-paper-8779804/",
     "You don't have to figure out the entire journey today. You just have to take the next meaningful step. MILE. Every step has a purpose."),
]

def run(args):
    print("+", " ".join(map(str, args)), flush=True)
    subprocess.run(args, check=True)

def require_file(path, minimum=1024):
    if not path.exists() or path.stat().st_size < minimum:
        raise RuntimeError(f"Expected media file was not created or is too small: {path}")
    return path

# Download five real, free-to-use Pexels video clips.
clips = []
for index, (url, _) in enumerate(SCENES, 1):
    target = WORK / f"scene{index}.mp4"
    run([
        "yt-dlp", "--no-warnings", "--no-progress", "--no-playlist", "--extractor-args", "generic:impersonate",
        "--force-overwrites", "-f",
        "bv*[ext=mp4][height<=1080]/b[ext=mp4]/best",
        "--merge-output-format", "mp4", "-o", str(target), url
    ])
    if not target.exists():
        candidates = sorted(WORK.glob(f"scene{index}.*"))
        if not candidates:
            raise RuntimeError(f"Pexels download failed for scene {index}: {url}")
        target = candidates[0]
    clips.append(require_file(target))

# Generate a warm Nigerian-English male voice-over.
narration = " ".join(line for _, line in SCENES)
audio = require_file(WORK / "narration.mp3", minimum=0) if (WORK / "narration.mp3").exists() else WORK / "narration.mp3"
run([
    "edge-tts", "--voice", "en-NG-AbeoNeural", "--rate", "-4%",
    "--pitch", "-2Hz", "--text", narration, "--write-media", str(audio)
])
require_file(audio, minimum=1024)

# Create five consistent 12-second widescreen scenes.
normalized = []
for index, clip in enumerate(clips, 1):
    output = WORK / f"normalized{index}.mp4"
    run([
        "ffmpeg", "-y", "-stream_loop", "-1", "-i", str(clip), "-t", "12",
        "-vf",
        "scale=1920:1080:force_original_aspect_ratio=increase,"
        "crop=1920:1080,setsar=1,fps=25,"
        "eq=contrast=1.06:saturation=0.92:brightness=-0.035,"
        "fade=t=in:st=0:d=0.55,fade=t=out:st=11.45:d=0.55",
        "-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(output)
    ])
    normalized.append(require_file(output))

concat_list = WORK / "clips.txt"
concat_list.write_text(
    "".join(f"file '{path.as_posix()}'\n" for path in normalized),
    encoding="utf-8"
)
joined = WORK / "joined.mp4"
run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i",
     str(concat_list), "-c", "copy", str(joined)])
require_file(joined)

# Mix narration with a subtle fade-out and retain a full 60-second picture.
final_video = MEDIA / "mile-film.mp4"
run([
    "ffmpeg", "-y", "-i", str(joined), "-i", str(audio),
    "-filter_complex",
    "[1:a]apad,atrim=0:60,volume=1.12,afade=t=out:st=57:d=3[a]",
    "-map", "0:v:0", "-map", "[a]", "-t", "60",
    "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
    "-movflags", "+faststart", str(final_video)
])
require_file(final_video, minimum=100_000)

vtt = """WEBVTT

00:00:00.000 --> 00:00:12.000
You have the skill. You have the ambition. You know there's more you can achieve.
But sometimes, knowing your next step isn't easy.

00:00:12.000 --> 00:00:24.000
You try different things. You improve your craft. You search for opportunities.
Yet progress can feel uncertain when you don't have a clear direction.

00:00:24.000 --> 00:00:38.000
That's where MILE comes in. Understand your services, strengthen your strategy,
explore your market and make more intentional moves.

00:00:38.000 --> 00:00:50.000
Growth isn't just about working harder. It's about learning, connecting
and becoming better with every step.

00:00:50.000 --> 00:01:00.000
You don't have to figure out the entire journey today.
Take the next meaningful step. MILE. Every step has a purpose.
"""
(MEDIA / "mile-film.vtt").write_text(vtt, encoding="utf-8")
print(f"SUCCESS: {final_video} ({final_video.stat().st_size:,} bytes)", flush=True)
