import { useState, useEffect } from "react"
import toast, { Toaster } from "react-hot-toast"
import "./index.css"
import { auth } from "./firebase"
import { signOut } from "firebase/auth"
import { useUser } from "./UserContext"
import Auth from "./Auth"

// Extracts video ID from any YouTube URL
function getYoutubeID(url) {
  const regex =
    /(?:youtube\.com.*(?:\/|v=|u\/\w\/|embed\/|watch\?v=)|youtu\.be\/)([^#\&\?]*).*/
  const match = url.match(regex)
  return match && match[1].length === 11 ? match[1] : null
}

function App() {
  const { user } = useUser()

  const [query, setQuery] = useState("")
  const [format, setFormat] = useState("mp3")
  const [downloadLink, setDownloadLink] = useState("")
  const [preview, setPreview] = useState(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (!query) {
      toast.error("Enter a song or YouTube link!")
      return
    }

    setIsDownloading(true)
    toast.loading("Downloading...")

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
      setIsDownloading(false)

      if (data.status === "success") {
        toast.success("Download ready!")
        setDownloadLink(`http://localhost:8000/file/${data.filename}`)
      } else {
        toast.error(data.error || "Download failed")
      }
    } catch (err) {
      toast.dismiss()
      toast.error("Backend not reachable")
      setIsDownloading(false)
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
    toast.success("Logged out!")
  }

  useEffect(() => {
    const isYouTubeUrl = query.includes("youtube.com") || query.includes("youtu.be")
    if (!isYouTubeUrl) {
      setPreview(null)
      return
    }

    const fetchPreview = async () => {
      try {
        const res = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(query)}&format=json`
        )
        const data = await res.json()
        setPreview(data)
      } catch (err) {
        setPreview(null)
      }
    }

    fetchPreview()
  }, [query])

  if (!user) return <Auth />

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-900 text-white font-sans flex items-center justify-center px-4 py-10 sm:py-20">
      <Toaster />
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg p-6 sm:p-10 rounded-2xl shadow-xl">
        <div className="flex justify-between mb-4 text-sm">
          <span className="text-white/80">👋 {user.email}</span>
          <button onClick={handleLogout} className="text-red-400 hover:underline">
            🚪 Logout
          </button>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-center flex items-center justify-center gap-2">
          🎧 <span className="text-white">PlaylistMiner</span>
        </h1>

        <input
          type="text"
          placeholder="Enter song name or YouTube link"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-5 py-4 rounded-lg text-black text-lg mb-6 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        {preview && (
          <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg mb-6">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={`https://www.youtube.com/embed/${getYoutubeID(query)}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube preview"
            ></iframe>
          </div>
        )}

        <label className="block text-white text-md mb-2">Choose Format:</label>
        <div className="flex space-x-4 mb-6">
          <button
            className={`flex-1 py-3 rounded-lg font-semibold transition ${
              format === "mp3"
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-white hover:bg-green-100 text-gray-800"
            }`}
            onClick={() => setFormat("mp3")}
          >
            🎵 MP3
          </button>
          <button
            className={`flex-1 py-3 rounded-lg font-semibold transition ${
              format === "mp4"
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-white hover:bg-blue-100 text-gray-800"
            }`}
            onClick={() => setFormat("mp4")}
          >
            🎬 MP4
          </button>
        </div>

        <button
          onClick={handleDownload}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white text-lg py-4 rounded-lg font-bold transition flex justify-center items-center"
          disabled={isDownloading}
        >
          {isDownloading ? (
            <svg
              className="animate-spin h-6 w-6 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          ) : (
            "⬇️ Download"
          )}
        </button>

        {downloadLink && (
          <div className="mt-6 text-center">
            <a
              href={downloadLink}
              target="_blank"
              className="text-white underline font-medium"
            >
              👉 Click here to download your file
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
