import { useState, useEffect } from "react";
import { Progress, Alert } from "flowbite-react";
import { FaPlayCircle, FaUpload } from "react-icons/fa";
import { toast } from "react-toastify";
import apiClient from "@/config/ApiClient"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Backend/Nginx limit se match — VideoStreamApp mein max upload size 500MB hai
const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024;
const MAX_FILE_SIZE_LABEL = "500MB";

export default function VideoUpload() {
  // State for video metadata (Title & Description)
  const [meta, setMeta] = useState({ title: "", description: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("No file selected");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  
  // Cleanup effect to revoke the object URL and avoid memory leaks
  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [videoPreview]);

  // Handle file selection and generate a local preview URL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Size check — 500MB se badi file ko upload shuru karne se pehle hi reject karo
    // (backend/nginx anyway reject karenge, par yahi rok dena better UX hai)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`File too large! Max allowed size is ${MAX_FILE_SIZE_LABEL}.`);
      e.target.value = ""; // input reset — same file dobara select karne pe change event fire ho
      return;
    }

    // Revoke previous URL if user changes the file
    if (videoPreview) URL.revokeObjectURL(videoPreview);

    setSelectedFile(file);
    setFileName(file.name);
    setVideoPreview(URL.createObjectURL(file));
  };

  // Main function to handle the upload process
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a video file first!");
      return;
    }

    // Prepare Multipart Form Data
    const formData = new FormData();
    formData.append("title", meta.title);
    formData.append("description", meta.description);
    formData.append("file", selectedFile);

    try {
      setUploading(true);
      setProgress(0);
      setShowSuccess(false);

      // API Call using the custom apiClient (Authorization is handled by interceptor)
      await apiClient.post("/videos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 0, // 10 minutes timeout for large uploads
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setProgress(percent);
        },
      });

      setShowSuccess(true);
      toast.success("Video uploaded successfully!");
      navigate("/UserHome/myvideos");
      
      // Optional: Reset form after success
      setMeta({ title: "", description: "" });
      setFileName("No file selected");
      setSelectedFile(null);

    } catch (error) {
      console.error("Upload Error:", error);
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Upload Failed";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-[#181818] p-5 sm:p-8 rounded-2xl shadow-2xl border border-gray-800">
      {/* Header Section */}
      <div className="flex items-center justify-center gap-3 mb-8 text-center">
        <FaPlayCircle className="text-red-600 text-3xl sm:text-4xl" />
        <h1 className="text-xl sm:text-3xl font-bold text-white uppercase tracking-tighter">
          Upload Your <span className="text-red-600">Video</span>
        </h1>
      </div>

      <form className="space-y-6" onSubmit={handleUpload}>
        {/* Video Title Input */}
        <div>
          <label className="text-sm font-semibold text-gray-400">Video Title</label>
          <input
            type="text"
            required
            value={meta.title}
            onChange={(e) => setMeta({ ...meta, title: e.target.value })}
            className="w-full mt-2 p-4 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-600 outline-none text-white"
            placeholder="Enter a catchy title..."
          />
        </div>

        {/* File Selection Area */}
        <div className="flex flex-col items-center p-8 border-2 border-dashed border-gray-700 rounded-2xl bg-gray-900/30 hover:border-red-600 transition-all cursor-pointer">
          <label className="cursor-pointer bg-red-600 hover:bg-red-700 px-8 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-lg shadow-red-600/20">
            <FaUpload /> Choose Video File
            <input type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
          </label>
          <span className="mt-3 text-sm text-gray-500 font-mono">{fileName}</span>
          <span className="mt-1 text-xs text-gray-600">Max file size: {MAX_FILE_SIZE_LABEL}</span>
        </div>

        {/* Local Video Preview */}
        {videoPreview && (
          <div className="rounded-xl overflow-hidden border border-gray-700 bg-black shadow-inner">
             <video src={videoPreview} controls className="w-full max-h-96 object-contain" />
          </div>
        )}

        {/* Description Input */}
        <div>
          <label className="text-sm font-semibold text-gray-400">Description (Optional)</label>
          <textarea
            rows={3}
            value={meta.description}
            onChange={(e) => setMeta({ ...meta, description: e.target.value })}
            className="w-full mt-2 p-4 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-600 outline-none text-white resize-none"
            placeholder="Tell your viewers about this video..."
          />
        </div>

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="py-2">
            <Progress progress={progress} size="lg" color="red" labelProgress labelText />
            <p className="text-center text-xs text-gray-500 mt-2 animate-pulse">Uploading to server, please wait...</p>
          </div>
        )}

        {/* Success Feedback */}
        {showSuccess && (
          <Alert color="success" onDismiss={() => setShowSuccess(false)}>
            <span className="font-bold">Success!</span> Video has been uploaded and is being processed. 🎉
          </Alert>
        )}

        {/* Submit Button */}
        {!showSuccess && (
          <button
            type="submit"
            disabled={uploading}
            className={`w-full py-4 rounded-xl text-lg font-black uppercase tracking-widest transition-all ${
              uploading 
                ? "bg-gray-700 cursor-not-allowed" 
                : "bg-red-600 hover:bg-red-700 active:scale-95 shadow-lg shadow-red-600/30"
            }`}
          >
            {uploading ? `Uploading ${progress}%` : "Publish Video"}
          </button>
        )}
      </form>
    </div>
  );
}