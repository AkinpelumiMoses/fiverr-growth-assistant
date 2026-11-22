#!/usr/bin/env python3
"""Build MILE's live-action welcome film from Pexels footage and neural narration."""
import os, subprocess, pathlib, textwrap

ROOT = pathlib.Path(__file__).resolve().parents[1]
MEDIA = ROOT / "public" / "media"
WORK = ROOT / ".mile-film-work"
MEDIA.mkdir(parents=True, exist_ok=True)
WORK.mkdir(parents=True, exist_ok=True)

SCENES = [
 ("https://www.pexels.com/video/focused-man-working-late-night-at-home-office-35331898/", "You have the skill. You have the ambition. You know there's more you can achieve. But sometimes, knowing your next step isn't easy."),
 ("https://www.pexels.com/video/man-working-late-at-home-desk-in-dim-room-35331905/", "You try different things. You improve your craft. You search for opportunities. Yet progress can feel uncertain when you don't have a clear direction."),
 ("https://www.pexels.com/video/a-man-typing-on-laptop-7546817/", "That's where MILE comes in. A place to understand your services, strengthen your strategy, explore your market and make more intentional moves."),
 ("https://www.pexels.com/video/businessmen-working-as-a-team-8425715/", "Because growth isn't just about working harder. It's about learning, connecting and becoming better with every step."),
 ("https://www.pexels.com/video/man-working-on-a-laptop-7171003/", "You don't have to figure out the entire journey today. You just have to take the next meaningful step. MILE. Every step has a purpose."),
]
def run(args):
    subprocess.run(args, check=True)

# Download actual MP4 footage from the selected free-to-use Pexels source pages.
clips=[]
for i,(url,_) in enumerate(SCENES,1):
    out=WORK / f"scene{i}.mp4"
    run(["yt-dlp","--no-warnings","--no-progress","-f","bv*[ext=mp4][height<=1080]/b[ext=mp4]/best",
         "--merge-output-format","mp4","-o",str(out),url])
    if not out.exists():
        candidates=list(WORK.glob(f"scene{i}.*"))
        if not candidates: raise RuntimeError(f"Could not download scene {i} from Pexels")
        out=candidates[0]
    clips.append(out)

narration=" ".join(line for _,line in SCENES)
audio=WORK/"narration.mp3"
run(["edge-tts","--voice","en-NG-AbeoNeural","--rate","-4%","--pitch","-2Hz","--text",narration,"--write-media",str(audio)])

# Normalize five live-action scenes, then join with subtle dissolves.
normalized=[]
for i,clip in enumerate(clips,1):
    out=WORK/f"normalized{i}.mp4"
    run(["ffmpeg","-y","-i",str(clip),"-t","12","-vf",
         "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,fps=25,eq=contrast=1.06:saturation=0.92:brightness=-0.035,fade=t=in:st=0:d=0.55,fade=t=out:st=11.45:d=0.55",
         "-an","-c:v","libx264","-preset","veryfast","-crf","23","-pix_fmt","yuv420p","-movflags","+faststart",str(out)])
    normalized.append(out)
concat=WORK/"joined.mp4"
with open(WORK/"clips.txt","w") as f:
    for p in normalized: f.write(f"file '{p.as_posix()}'\n")
run(["ffmpeg","-y","-f","concat","-safe","0","-i",str(WORK/"clips.txt"),"-c","copy",str(concat)])
# Voice track is mixed over the film; if narration runs short, keep the final image on screen.
run(["ffmpeg","-y","-i",str(concat),"-i",str(audio),"-filter_complex",
     "[1:a]apad,atrim=0:60,volume=1.18,afade=t=out:st=57:d=3[a]",
     "-map","0:v:0","-map","[a]","-t","60","-c:v","copy","-c:a","aac","-b:a","192k","-shortest","-movflags","+faststart",str(MEDIA/"mile-film.mp4")])

# WebVTT captions timed to the five story chapters.
vtt="""WEBVTT

00:00:00.000 --> 00:00:12.000
You have the skill. You have the ambition. You know there's more you can achieve.
But sometimes, knowing your next step isn't easy.

00:00:12.000 --> 00:00:24.000
You try different things. You improve your craft. You search for opportunities.
Yet progress can feel uncertain without clear direction.

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
(MEDIA/"mile-film.vtt").write_text(vtt,encoding="utf-8")
print("Built", MEDIA/"mile-film.mp4")
