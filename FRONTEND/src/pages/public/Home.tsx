import { useEffect, useState } from "react";
import VideoCard from "../../components/Video/VideoCard";
import type { Video } from "../../models/Video";
import { getAllVideos } from "../../service/VideoService";

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await getAllVideos();
        setVideos(data);
      } catch {
        setError("Unable to fetch videos.");
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  return (
    <div className="p-6 bg-[#0f0f0f] min-h-screen text-white">
      <h2 className="text-3xl font-bold mb-8 border-l-4 border-red-600 pl-4 uppercase">
        Explore Videos
      </h2>

      {loading && <p className="text-center animate-pulse">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && videos.length === 0 && (
        <p className="text-center text-gray-400">No videos found.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {videos.map((video) => (
          <VideoCard
            key={video.videoId}
            videoId={video.videoId}
            title={video.title}
            description={video.description}
            userName={video.userName}
            contentType={video.contentType}
            createdAt={video.createdAt}
          />
        ))}
      </div>
    </div>
  );
}