import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import VideoPlayer from "../../components/Video/VideoPlayer";
import { Spinner } from "@/components/ui/spinner";
import apiClient from "@/config/ApiClient";
import { getHlsMasterUrl, getAllVideos, incrementView } from "@/service/VideoService";
import type { Video } from "@/models/Video";
import { ArrowLeft, Calendar, Eye, Film } from "lucide-react";
import VideoCard from "@/components/Video/VideoCard";
import CommentSection from "@/components/Video/CommentSection";

export default function WatchVideo() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [videoData, setVideoData] = useState<Video | null>(null);
  const [related, setRelated] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 30s threshold — sirf tab view bhejenge jab user ne 30 sec actually dekha ho
  const viewSentRef = useRef(false);

  useEffect(() => {
    if (!videoId) return;
    // Naye video pe reset
    viewSentRef.current = false;
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

  // 30s watch hone par ek baar view bhejo (useCallback — VideoPlayer effect dependency stable rahe)
  const handleWatchTime = useCallback((watchedSeconds: number) => {
    if (viewSentRef.current || watchedSeconds < 30) return;
    viewSentRef.current = true;
    incrementView(videoId!).then((count) => {
      setVideoData((prev) => (prev ? { ...prev, viewCount: count } : prev));
    }).catch(() => {});
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

  const formatViews = (count?: number) => {
    if (!count) return "0 views";
    if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + "M views";
    if (count >= 1_000) return (count / 1_000).toFixed(1) + "K views";
    return count + (count === 1 ? " view" : " views");
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
            <VideoPlayer src={getHlsMasterUrl(videoId)} onWatchTime={handleWatchTime} />
          </div>

          {/* Title */}
          <h1 className="text-xl md:text-2xl font-bold mt-4 leading-snug">
            {videoData?.title || "Untitled Video"}
          </h1>

          {/* Category badge */}
          {videoData?.category && (
            <span className="inline-block mt-2 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
              {videoData.category}
            </span>
          )}

          {/* Uploader Info + Date */}
          <div className="flex items-center justify-between mt-3 pb-3 border-b border-gray-800">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm shrink-0 cursor-pointer"
                onClick={() => videoData?.userId && navigate(`/channel/${videoData.userId}`)}
                title={videoData?.userName}
              >
                {getInitials(videoData?.userName)}
              </div>
              <div>
                <button
                  className="text-white font-semibold text-sm hover:text-red-500 transition-colors text-left"
                  onClick={() => videoData?.userId && navigate(`/channel/${videoData.userId}`)}
                >
                  {videoData?.userName || "Unknown"}
                </button>
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

          {/* Views counter */}
          <div className="flex items-center gap-1.5 text-gray-400 text-sm mt-3">
            <Eye size={15} className="text-red-600" />
            <span className="font-semibold">{formatViews(videoData?.viewCount)}</span>
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
                  userId={v.userId}
                  contentType={v.contentType}
                  category={v.category}
                  createdAt={v.createdAt}
                  viewCount={v.viewCount}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
