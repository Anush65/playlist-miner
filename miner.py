from youtubesearchpython import VideosSearch
import yt_dlp

def is_youtube_playlist(url):
    return "youtube.com/playlist?" in url

def get_video_list(query, min_views=0, limit=5):
    if is_youtube_playlist(query):
        ydl_opts = {
            'quiet': True,
            'extract_flat': True,
            'force_generic_extractor': True
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(query, download=False)
            return [{'title': v['title'], 'link': v['url']} for v in info['entries']]

    else:
        results = VideosSearch(query, limit=limit).result()
        video_list = []
        for video in results['result']:
            try:
                views = int(video['viewCount']['text'].replace(',', '').replace(' views', ''))
                if views >= min_views:
                    video_list.append({
                        'title': video['title'],
                        'link': video['link']
                    })
            except:
                continue
        return video_list
