from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from downloader import download_video
from youtubesearchpython import VideosSearch
import os

app = FastAPI()

# Allow frontend (React dev server) to access this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DOWNLOAD_FOLDER = "downloads"

@app.post("/download")
async def download(query: str = Form(...), format: str = Form("mp3")):
    try:
        filename = download_video(query, format)
        return JSONResponse({"status": "success", "filename": filename})
    except Exception as e:
        return JSONResponse({"status": "error", "error": str(e)})

@app.get("/file/{filename}")
def serve_file(filename: str):
    file_path = os.path.join(DOWNLOAD_FOLDER, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, filename=filename)
    return JSONResponse({"error": "File not found"}, status_code=404)

@app.post("/preview")
async def preview(query: str = Form(...)):
    try:
        videos = VideosSearch(query, limit=1)
        result = videos.result()
        if result["result"]:
            video = result["result"][0]
            return {
                "status": "success",
                "title": video["title"],
                "videoId": video["id"],
                "url": video["link"],
            }
        else:
            return {"status": "error", "error": "No results found."}
    except Exception as e:
        return {"status": "error", "error": str(e)}
