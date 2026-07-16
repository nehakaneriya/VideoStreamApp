import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import VideoCard from "../../components/Video/VideoCard";
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

  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

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

    const fetchVideos = async () => {
      try {
        const data = await getMyVideos();
        setVideos(data);
      } catch {
        console.error("Failed to fetch videos");
        toast.error("Failed to load videos");
      } finally {
        setLoading(false);
      }
    };

    getUserData();
    fetchVideos();
  }, [user?.email]);

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

      {/* Header */}
      <div className="flex justify-between items-center mb-8">

        <div>
          <h2 className="text-3xl font-bold border-l-4 border-red-600 pl-4 uppercase">
            Your Dashboard
          </h2>

          {user1 && (
            <p className="text-gray-400 mt-1">
              Welcome {user1.name} 👋
            </p>
          )}
        </div>

        <button
          onClick={() => navigate("/UserHome/upload")}
          className="bg-red-600 px-6 py-2 rounded-lg hover:bg-red-700 transition cursor-pointer"
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
            createdAt={video.createdAt}
            onDelete={handleDelete}
          />
        ))}

      </div>

    </div>
  );
}