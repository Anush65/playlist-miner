import { useState, useEffect } from "react"
import toast, { Toaster } from "react-hot-toast"

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [query, setQuery] = useState("")
  const [format, setFormat] = useState("mp3")
  const [downloadLink, setDownloadLink] = useState("")
  const [previewId, setPreviewId] = useState(null)

  // Splash screen (2s)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  // Detect YouTube link or fetch preview from backend
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const ytRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s&]+)/

      const match = query.match(ytRegex)
      if (match && match[1]) {
        setPreviewId(match[1])
      } else {
        // If it's a search term, hit the backend preview route
        if (query.trim()) {
          fetch("http://localhost:8000/preview", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({ query }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.status === "success") {
                setPreviewId(data.videoId)
              } else {
                setPreviewId(null)
              }
            })
            .catch(() => setPreviewId(null))
        } else {
          setPreviewId(null)
        }
      }
    }, 500)

    return () => clearTimeout(delayDebounce)
  }, [query])

  const handleDownload = async () => {
    if (!query) {
      toast.error("❗ Please enter a search query or YouTube URL")
      return
    }

    toast.loading("⏳ Downloading...")
    setDownloadLink("")

    const formData = new FormData()
    formData.append("query", query)
    formData.append("format", format)

    try {
      const res = await fetch("http://localhost:8000/download", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      toast.dismiss()

      if (data.status === "success") {
        setDownloadLink(`http://localhost:8000/file/${data.filename}`)
        toast.success("✅ Download Ready!")
      } else {
        toast.error("❌ Error: " + data.error)
      }
    } catch (error) {
      toast.dismiss()
      toast.error("❌ Could not connect to backend.")
    }
  }

  if (showSplash) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-black">
        <h1 className="text-4xl font-bold animate-pulse">🎧 PlaylistMiner</h1>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black px-4">
      <Toaster />
      <div className="max-w-md w-full p-6 bg-gray-100 rounded shadow animate-fadeIn">
        <h1 className="text-3xl font-bold mb-6 text-center">🎧 PlaylistMiner</h1>

        <input
          type="text"
          placeholder="Enter song name or YouTube link"
          className="w-full p-2 mb-4 border rounded"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <p className="text-sm mb-2 font-medium text-gray-600 text-center">
          Choose Format:
        </p>

        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => setFormat("mp3")}
            className={`px-4 py-2 rounded border font-semibold flex items-center gap-2 transition-all duration-200
              ${format === "mp3"
                ? "bg-blue-600 text-white scale-105 shadow-md"
                : "bg-gray-200 text-black hover:bg-gray-300"}`}
          >
            🎵 MP3 {format === "mp3" && "✅"}
          </button>

          <button
            onClick={() => setFormat("mp4")}
            className={`px-4 py-2 rounded border font-semibold flex items-center gap-2 transition-all duration-200
              ${format === "mp4"
                ? "bg-blue-600 text-white scale-105 shadow-md"
                : "bg-gray-200 text-black hover:bg-gray-300"}`}
          >
            🎥 MP4 {format === "mp4" && "✅"}
          </button>
        </div>

        {previewId && (
          <div className="mb-4">
            <iframe
              className="w-full aspect-video rounded"
              src={`https://www.youtube.com/embed/${previewId}`}
              title="Preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}

        <button
          onClick={handleDownload}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
        >
          Download
        </button>

        {downloadLink && (
          <div className="mt-4 text-center">
            <a
              href={downloadLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              👉 Click to download
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
