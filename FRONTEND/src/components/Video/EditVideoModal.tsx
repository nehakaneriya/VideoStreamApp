import { useState } from "react";
import { X, Pencil, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { updateVideo } from "@/service/VideoService";
import axios from "axios";

interface EditVideoModalProps {
  videoId: string;
  currentTitle: string;
  currentDescription?: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditVideoModal({
  videoId,
  currentTitle,
  currentDescription,
  onClose,
  onSaved,
}: EditVideoModalProps) {
  const [title, setTitle] = useState(currentTitle || "");
  const [description, setDescription] = useState(currentDescription || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      toast.error("Title cannot be empty");
      return;
    }

    // Kuch change hua bhi ya nahi?
    if (trimmed === currentTitle && description === (currentDescription || "")) {
      toast.info("No changes to save");
      onClose();
      return;
    }

    try {
      setSaving(true);
      await updateVideo(videoId, { title: trimmed, description });
      toast.success("Video details updated!");
      onSaved();
      onClose();
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Failed to update video. Please try again.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div className="bg-[#181818] border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          disabled={saving}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition disabled:opacity-40 cursor-pointer"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Pencil size={18} className="text-red-500" />
          Edit Video
        </h2>

        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={saving}
              className="w-full p-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition disabled:opacity-50"
              placeholder="Enter video title"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-400 block mb-1">
              Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
              className="w-full p-3 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition resize-none disabled:opacity-50"
              placeholder="Tell your viewers about this video..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition font-medium disabled:opacity-40 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 transition font-medium disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
