import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import VideoCard from "../../components/Video/VideoCard";
import EditVideoModal from "../../components/Video/EditVideoModal";
import type { Video } from "../../models/Video";
import { deleteVideo, getMyVideos } from "../../service/VideoService";
import { getCurrentUser } from "@/service/Authservice";
import useAuthStore from "@/auth/store";
import type UserT from "@/models/User";
import { toast } from "react-toastify";

export default function UserHome() {

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [user1, setUser1] = useState<UserT | null>(null);
  const [editVideo, setEditVideo] = useState<Video | null>(null);

  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const fetchVideos = useCallback(async () => {
    try {
      const data = await getMyVideos();
      setVideos(data);
    } catch {
      console.error("Failed to fetch videos");
      toast.error("Failed to load videos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const getUserData = async () => {
      try {
        if (!user?.email) return;
        const data = await getCurrentUser(user.email);
        setUser1(data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast.error("Failed to load user data");
      }
    };

    getUserData();
    fetchVideos();
  }, [user?.email, fetchVideos]);

  // 🔹 Delete Video
  const handleDelete = async (id: string) => {
    try {
      await deleteVideo(id);

      setVideos((prev) =>
        prev.filter((v) => v.videoId !== id)
      );

      toast.success("Video deleted successfully");
    } catch {
      console.error("Delete failed");
      toast.error("Failed to delete video");
    }
  };

  return (
    <div className="p-6 bg-[#0f0f0f] min-h-screen text-white">

      {/* Header — profile style: name + email */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center text-2xl font-bold text-white select-none shrink-0">
            {(user1?.name || user?.name || "U").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold truncate">
              {user1?.name || user?.name || "User"}
            </h2>
            <p className="text-gray-400 text-sm truncate">
              {user?.email || user1?.email}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/UserHome/upload")}
          className="bg-red-600 px-6 py-2 rounded-lg hover:bg-red-700 transition cursor-pointer text-sm sm:text-base"
        >
          + Upload Video
        </button>

      </div>

      {/* Loading */}
      {loading && (
        <p className="text-center text-gray-400">
          Loading videos...
        </p>
      )}

      {/* No Videos */}
      {!loading && videos.length === 0 && (
        <p className="text-center text-gray-400">
          No videos uploaded yet 🎬
        </p>
      )}

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">

        {videos.map((video) => (
          <VideoCard
            key={video.videoId}
            videoId={video.videoId}
            title={video.title}
            description={video.description}
            userName={video.userName}
            contentType={video.contentType}
            category={video.category}
            createdAt={video.createdAt}
            viewCount={video.viewCount}
            onDelete={handleDelete}
            onEdit={(id) => {
              const v = videos.find((item) => item.videoId === id);
              if (v) setEditVideo(v);
            }}
          />
        ))}

      </div>

      {/* Edit Video Modal */}
      {editVideo && (
        <EditVideoModal
          videoId={editVideo.videoId}
          currentTitle={editVideo.title}
          currentDescription={editVideo.description}
          onClose={() => setEditVideo(null)}
          onSaved={fetchVideos}
        />
      )}

    </div>
  );
}