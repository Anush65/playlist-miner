// src/Auth.jsx
import { useState } from "react"
import { auth } from "./firebase"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth"
import toast, { Toaster } from "react-hot-toast"

function Auth() {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleAuth = async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password)
        toast.success("✅ Account created!")
      } else {
        await signInWithEmailAndPassword(auth, email, password)
        toast.success("✅ Logged in successfully!")
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-800 to-indigo-900 flex items-center justify-center text-white px-6">
      <Toaster />
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6">
          {isSignup ? "📝 Sign Up" : "🔐 Sign In"}
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-3 mb-4 rounded text-black focus:outline-none focus:ring-2 focus:ring-purple-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 mb-6 rounded text-black focus:outline-none focus:ring-2 focus:ring-purple-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleAuth}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-lg transition"
        >
          {isSignup ? "Create Account" : "Login"}
        </button>

        <div className="text-center mt-4">
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-white/80 hover:text-white underline text-sm"
          >
            {isSignup
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Auth
