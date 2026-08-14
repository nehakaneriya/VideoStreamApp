import { useEffect, useMemo, useState } from "react";
import { getAllVideosAdmin, deleteVideoAdmin, getCategoryStats, type CategoryStats } from "../../service/Adminservice";
import { getAllCategories } from "../../service/CategoryService";
import type { Video } from "../../models/Video";
import type { Category } from "../../models/Category";
import { Trash2, Video as VideoIcon, Tag, MessageCircle, Eye } from "lucide-react";

export default function Videos() {

  const [videos, setVideos] = useState<Video[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadVideos = () => {
    setLoading(true);
    getAllVideosAdmin()
      .then(setVideos)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVideos();
    getCategoryStats()
      .then(setCategoryStats)
      .catch(console.error);
    getAllCategories()
      .then(setCategories)
      .catch(console.error);
  }, []);

  // Category filter ke hisaab se videos filter karo
  const filteredVideos = useMemo(() => {
    if (activeCategory === "all") return videos;
    return videos.filter((v) => (v.category || "other") === activeCategory);
  }, [videos, activeCategory]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    setDeletingId(id);
    try {
      await deleteVideoAdmin(id);
      loadVideos();
      // Category stats bhi refresh karo — count change hua hoga
      getCategoryStats().then(setCategoryStats).catch(console.error);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-2">
      <h1 className="text-3xl font-bold mb-6">
        <span className="text-red-600">Manage</span> Videos
      </h1>

      {/* Stats Bar */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="bg-[#181818] border border-gray-800 rounded-lg px-4 py-2 flex items-center gap-2">
          <VideoIcon size={16} className="text-red-600" />
          <span className="text-gray-400 text-sm">Total:</span>
          <span className="font-bold">{videos.length}</span>
        </div>
      </div>

      {/* Category Stats — har category me kitne videos */}
      {categoryStats.length > 0 && (
        <div className="mb-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            <Tag size={15} className="text-red-600" />
            Videos per Category
          </h2>
          <div className="flex flex-wrap gap-2">
            {categoryStats.map((stat) => (
              <div
                key={stat.slug}
                className="bg-[#181818] border border-gray-800 rounded-xl px-4 py-2.5 flex items-center gap-3 hover:border-red-600/50 transition"
              >
                <span className="w-2 h-2 rounded-full bg-red-600" />
                <span className="text-sm font-medium capitalize">{stat.name}</span>
                <span className="text-xs text-gray-500">
                  <span className="font-bold text-white">{stat.videoCount}</span> videos
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer border ${
            activeCategory === "all"
              ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/30"
              : "bg-[#181818] border-gray-700 text-gray-300 hover:border-red-600/50 hover:text-white"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.slug)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer border ${
              activeCategory === cat.slug
                ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/30"
                : "bg-[#181818] border-gray-700 text-gray-300 hover:border-red-600/50 hover:text-white"
            }`}
          >
            {cat.name}
          </button>
        ))}
        <button
          onClick={() => setActiveCategory("other")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer border ${
            activeCategory === "other"
              ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/30"
              : "bg-[#181818] border-gray-700 text-gray-300 hover:border-red-600/50 hover:text-white"
          }`}
        >
          Other
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading videos...</div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No videos found</div>
      ) : (
        <div className="bg-[#181818] border border-gray-800 rounded-xl overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-[#111] border-b border-gray-800">
              <tr>
                <th className="p-4 text-gray-400 text-sm">Title</th>
                <th className="p-4 text-gray-400 text-sm">Description</th>
                <th className="p-4 text-gray-400 text-sm">Owner</th>
                <th className="p-4 text-gray-400 text-sm">Category</th>
                <th className="p-4 text-gray-400 text-sm">Views</th>
                <th className="p-4 text-gray-400 text-sm">Comments</th>
                <th className="p-4 text-gray-400 text-sm">Type</th>
                <th className="p-4 text-gray-400 text-sm">Uploaded</th>
                <th className="p-4 text-gray-400 text-sm">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredVideos.map(video => (
                <tr
                  key={video.videoId}
                  className="border-b border-gray-800 hover:bg-[#1f1f1f] transition"
                >
                  {/* Title */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-red-600/20 flex items-center justify-center">
                        <VideoIcon size={14} className="text-red-500" />
                      </div>
                      <span className="font-medium">{video.title}</span>
                    </div>
                  </td>

                  {/* Description */}
                  <td className="p-4 text-gray-400 text-sm max-w-[200px] truncate">
                    {video.description || "—"}
                  </td>

                  {/* Owner */}
                  <td className="p-4">
                    <div>
                      <p className="text-sm font-medium">
                        {video.userName || "—"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {video.userEmail || "—"}
                      </p>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 bg-red-600/15 text-red-400 px-2.5 py-1 rounded-full text-xs font-medium capitalize">
                      <Tag size={11} />
                      {video.category || "other"}
                    </span>
                  </td>

                  {/* Views */}
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 text-gray-300 text-sm">
                      <Eye size={14} className="text-gray-500" />
                      {(video.viewCount ?? 0).toLocaleString()}
                    </span>
                  </td>

                  {/* Comments */}
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 text-gray-300 text-sm">
                      <MessageCircle size={14} className="text-gray-500" />
                      {video.commentCount ?? 0}
                    </span>
                  </td>

                  {/* Content Type */}
                  <td className="p-4">
                    <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs">
                      {video.contentType?.split("/")[1]?.toUpperCase() || "—"}
                    </span>
                  </td>

                  {/* Uploaded At */}
                  <td className="p-4 text-gray-400 text-sm">
                    {video.createdAt
                      ? new Date(video.createdAt).toLocaleDateString()
                      : "—"}
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <button
                      onClick={() => handleDelete(video.videoId)}
                      disabled={deletingId === video.videoId}
                      className="flex items-center gap-1 px-3 py-1 bg-red-600 rounded hover:bg-red-500 text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                    >
                      <Trash2 size={14} />
                      {deletingId === video.videoId ? "..." : "Delete"}
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
