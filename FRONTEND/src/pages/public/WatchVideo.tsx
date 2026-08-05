import { useEffect, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import VideoPlayer from "../../components/Video/VideoPlayer";
import { Spinner } from "@/components/ui/spinner";
import apiClient from "@/config/ApiClient";
import { getHlsMasterUrl, getAllVideos } from "@/service/VideoService";
import type { Video } from "@/models/Video";
import { ArrowLeft, Calendar, Film } from "lucide-react";
import VideoCard from "@/components/Video/VideoCard";
import CommentSection from "@/components/Video/CommentSection";

export default function WatchVideo() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [videoData, setVideoData] = useState<Video | null>(null);
  const [related, setRelated] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) return;
    const fetchDetails = async () => {
      try {
        const [videoRes, allVideos] = await Promise.all([
          apiClient.get(`/videos/${videoId}`),
          getAllVideos("", undefined, 12),
        ]);
        setVideoData(videoRes.data);
        // Current video ko hata ke baaki dikhao
        setRelated(allVideos.content.filter((v) => v.videoId !== videoId).slice(0, 8));
      } catch {
        setError("Failed to load video.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [videoId]);

  if (!videoId) return <Navigate to="/" replace />;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0f0f0f]">
        <Spinner className="w-12 h-12 text-red-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#0f0f0f] text-white gap-4">
        <Film size={48} className="text-red-600" />
        <p className="text-red-500 text-lg">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-red-600 rounded-full hover:bg-red-500 transition text-sm"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    // Right click disable
    <div
      className="min-h-screen bg-[#0f0f0f] text-white"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm mb-4"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-10 flex flex-col lg:flex-row gap-6">

        {/* LEFT — Player + Info */}
        <div className="flex-1 min-w-0">

          {/* Video Player */}
          <div className="rounded-xl overflow-hidden">
            <VideoPlayer src={getHlsMasterUrl(videoId)} />
          </div>

          {/* Title */}
          <h1 className="text-xl md:text-2xl font-bold mt-4 leading-snug">
            {videoData?.title || "Untitled Video"}
          </h1>

          {/* Uploader Info + Date */}
          <div className="flex items-center justify-between mt-3 pb-3 border-b border-gray-800">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {getInitials(videoData?.userName)}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">
                  {videoData?.userName || "Unknown"}
                </p>
                <p className="text-gray-500 text-xs">Uploader</p>
              </div>
            </div>

            {/* Date */}
            {videoData?.createdAt && (
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <Calendar size={13} />
                <span>{formatDate(videoData.createdAt)}</span>
              </div>
            )}
          </div>

          {/* Description Box */}
          {videoData?.description && (
            <div className="mt-3 bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {videoData.description}
              </p>
            </div>
          )}

          {/* Comments Section */}
          <CommentSection videoId={videoId} />
        </div>

        {/* RIGHT — Related Videos */}
        {related.length > 0 && (
          <div className="lg:w-80 xl:w-96 shrink-0">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              More Videos
            </h2>
            <div className="flex flex-col gap-3">
              {related.map((v) => (
                <VideoCard
                  key={v.videoId}
                  videoId={v.videoId}
                  title={v.title}
                  description={v.description}
                  userName={v.userName}
                  contentType={v.contentType}
                  createdAt={v.createdAt}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
