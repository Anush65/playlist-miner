import tkinter as tk
from tkinter import filedialog, ttk, messagebox
import threading
import os
from downloader import download_video
from miner import get_video_list

class PlaylistMinerGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("🎧 Playlist Miner - GUI")
        self.root.geometry("600x500")
        self.root.resizable(False, False)

        self.audio_only = tk.BooleanVar(value=True)
        self.use_batch_file = tk.BooleanVar(value=False)

        self.build_ui()

    def build_ui(self):
        tk.Label(self.root, text="Search Query or Playlist URL:", font=("Arial", 12)).pack(pady=5)
        self.query_entry = tk.Entry(self.root, width=60, font=("Arial", 12))
        self.query_entry.pack(pady=5)

        options_frame = tk.Frame(self.root)
        options_frame.pack(pady=5)
        ttk.Checkbutton(options_frame, text="Download as MP3", variable=self.audio_only).pack(side=tk.LEFT, padx=10)
        ttk.Checkbutton(options_frame, text="Use search_terms.txt", variable=self.use_batch_file).pack(side=tk.LEFT, padx=10)

        tk.Label(self.root, text="Number of top results per query:", font=("Arial", 10)).pack()
        self.num_results = tk.Spinbox(self.root, from_=1, to=10, width=5)
        self.num_results.pack()

        self.download_btn = tk.Button(self.root, text="⬇️ Start Download", command=self.start_download_thread, bg="#4CAF50", fg="white", font=("Arial", 12))
        self.download_btn.pack(pady=15)

        self.progress = ttk.Progressbar(self.root, orient="horizontal", mode="determinate", length=400)
        self.progress.pack(pady=5)

        tk.Label(self.root, text="Log:", font=("Arial", 12)).pack()
        self.log_box = tk.Text(self.root, height=12, width=72, state="disabled", font=("Consolas", 10))
        self.log_box.pack(pady=5)

    def log(self, msg):
        self.log_box.config(state="normal")
        self.log_box.insert(tk.END, msg + "\n")
        self.log_box.config(state="disabled")
        self.log_box.see(tk.END)

    def start_download_thread(self):
        t = threading.Thread(target=self.download_handler)
        t.start()

    def progress_hook(self, d):
        if d['status'] == 'downloading':
            percent = d.get('_percent_str', '0.0%').replace('%', '')
            try:
                self.progress['value'] = float(percent)
                self.root.update_idletasks()
            except:
                pass

    def download_handler(self):
        queries = []

        if self.use_batch_file.get():
            try:
                with open("search_terms.txt", "r", encoding="utf-8") as f:
                    queries = [line.strip() for line in f if line.strip()]
                self.log("📁 Loaded queries from search_terms.txt")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to read file: {e}")
                return
        else:
            query = self.query_entry.get().strip()
            if not query:
                messagebox.showerror("Error", "Please enter a query or enable batch mode.")
                return
            queries = [query]

        self.progress['value'] = 0
        total = len(queries)
        for idx, query in enumerate(queries):
            self.log(f"🔍 [{idx+1}/{total}] Searching: {query}")

            try:
                results = get_video_list(query, min_views=50000, limit=int(self.num_results.get()))
                if not results:
                    self.log("❌ No results found.")
                    continue

                for vid in results:
                    self.log(f"⬇️ Downloading: {vid['title']}")
                    download_video(vid['link'], audio_only=self.audio_only.get(), log=self.progress_hook)
                    self.log(f"✅ Done: {vid['title']}")
                    self.progress['value'] = 0

            except Exception as e:
                self.log(f"❌ Error: {str(e)}")

        self.log("🎉 All downloads completed!")

if __name__ == "__main__":
    root = tk.Tk()
    app = PlaylistMinerGUI(root)
    root.mainloop()
