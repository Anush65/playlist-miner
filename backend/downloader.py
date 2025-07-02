import yt_dlp
import os
import uuid

DOWNLOAD_FOLDER = "downloads"

def download_video(query: str, format: str = "mp3") -> str:
    os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)

    unique_id = uuid.uuid4().hex[:8]
    output_template = os.path.join(DOWNLOAD_FOLDER, f"{unique_id}.%(ext)s")

    ydl_opts = {
        "format": "bestaudio/best" if format == "mp3" else "bestvideo+bestaudio",
        "outtmpl": output_template,
        "noplaylist": True,
        "quiet": True,
        "default_search": "ytsearch",  # 👈 THIS IS THE FIX
        "postprocessors": [],
    }

    if format == "mp3":
        ydl_opts["postprocessors"].append({
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
            "preferredquality": "192",
        })

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(query, download=True)
        ext = "mp3" if format == "mp3" else info.get("ext", "mp4")
        return f"{unique_id}.{ext}"
