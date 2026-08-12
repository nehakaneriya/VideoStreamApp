import { useEffect, useState } from "react";
// 1. Service import karein
import { getMyVideos } from "../../service/VideoService";
import { deleteVideo as deleteVideoService } from "../../service/VideoService";
import VideoCard from "../../components/Video/VideoCard";
import EditVideoModal from "../../components/Video/EditVideoModal";
import { FaPlayCircle } from "react-icons/fa";
import type { Video } from "../../models/Video";
import { toast } from "react-toastify";
import axios from "axios";

export default function MyVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [editVideo, setEditVideo] = useState<Video | null>(null);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const data: Video[] = await getMyVideos();
      setVideos(data);
    } catch (err) {
      console.error("Error fetching videos: ", err);
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Failed to load videos";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleDelete = async (videoId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this video?"
    );
    if (!confirmDelete) return;

    try {
      await deleteVideoService(videoId); // Delete via service
      
      // State update karein (UI se turant hatane ke liye)
      setVideos((prev) => prev.filter((video) => video.videoId !== videoId));
      toast.success("Video deleted successfully! 🗑️");
    } catch {
      toast.error("Delete failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex justify-center px-4 py-16">
      <div className="w-full max-w-6xl">

        <div className="flex items-center justify-center gap-3 mb-12 text-center">
          <FaPlayCircle className="text-red-600 text-3xl sm:text-4xl" />
          <h2 className="text-xl sm:text-3xl font-bold text-red-600 uppercase tracking-wider">
            My Video Library
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center mt-20">
             <p className="text-xl text-gray-400 animate-pulse">Fetching your videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center mt-20">
            <p className="text-gray-400 text-lg mb-4">No videos uploaded yet 🎬</p>
            {/* Aap yahan ek link de sakte hain jo Upload page par le jaye */}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((v) => (
              <div
                key={v.videoId}
                className="bg-[#181818] p-4 rounded-2xl border border-gray-800 shadow-2xl hover:border-red-600/50 transition-all duration-300"
              >
                <VideoCard
                  videoId={v.videoId}
                  title={v.title}
                  description={v.description}
                  userName={v.userName}
                  contentType={v.contentType}
                  createdAt={v.createdAt}
                  onDelete={handleDelete}
                  onEdit={(id) => {
                    const found = videos.find((item) => item.videoId === id);
                    if (found) setEditVideo(found);
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Edit Video Modal */}
        {editVideo && (
          <EditVideoModal
            videoId={editVideo.videoId}
            currentTitle={editVideo.title}
            currentDescription={editVideo.description}
            onClose={() => setEditVideo(null)}
            onSaved={loadVideos}
          />
        )}

      </div>
    </div>
  );
}