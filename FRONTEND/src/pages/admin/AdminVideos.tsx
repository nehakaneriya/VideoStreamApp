import { useEffect, useState } from "react";
import { getAllVideosAdmin, deleteVideoAdmin } from "../../service/Adminservice";
import type { Video } from "../../models/Video";
import { Trash2, Video as VideoIcon } from "lucide-react";

export default function Videos() {

  const [videos, setVideos] = useState<Video[]>([]);
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
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    setDeletingId(id);
    try {
      await deleteVideoAdmin(id);
      loadVideos();
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
      <div className="flex gap-4 mb-6">
        <div className="bg-[#181818] border border-gray-800 rounded-lg px-4 py-2 flex items-center gap-2">
          <VideoIcon size={16} className="text-red-600" />
          <span className="text-gray-400 text-sm">Total:</span>
          <span className="font-bold">{videos.length}</span>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading videos...</div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No videos found</div>
      ) : (
        <div className="bg-[#181818] border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#111] border-b border-gray-800">
              <tr>
                <th className="p-4 text-gray-400 text-sm">Title</th>
                <th className="p-4 text-gray-400 text-sm">Description</th>
                <th className="p-4 text-gray-400 text-sm">Owner</th>
                <th className="p-4 text-gray-400 text-sm">Type</th>
                <th className="p-4 text-gray-400 text-sm">Uploaded</th>
                <th className="p-4 text-gray-400 text-sm">Actions</th>
              </tr>
            </thead>

            <tbody>
              {videos.map(video => (
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
