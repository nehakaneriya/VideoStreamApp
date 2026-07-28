import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Trash2, Loader2, User, PlayCircle } from "lucide-react";
import { getAllCommentsAdmin, deleteCommentAdmin } from "@/service/CommentService";
import type { Comment } from "@/models/Comment";
import { toast } from "react-toastify";

export default function AdminComments() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await getAllCommentsAdmin();
                setComments(data);
            } catch {
                toast.error("Failed to load comments");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this comment?")) return;
        try {
            setDeletingId(id);
            await deleteCommentAdmin(id);
            setComments((prev) => prev.filter((c) => c.id !== id));
            toast.success("Comment deleted");
        } catch {
            toast.error("Failed to delete comment");
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    };

    return (
        <div className="p-2">

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">
                    <span className="text-red-600">Video</span> Comments
                </h1>
                {!loading && (
                    <span className="text-sm text-gray-400 bg-[#181818] border border-gray-700 px-3 py-1 rounded-full">
                        {comments.length} total
                    </span>
                )}
            </div>

            {/* Loading */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 size={36} className="animate-spin text-red-600" />
                </div>

            /* Empty */
            ) : comments.length === 0 ? (
                <div className="bg-[#181818] border border-gray-800 rounded-xl p-16 text-center">
                    <MessageCircle size={52} className="text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg font-medium">No comments yet</p>
                    <p className="text-gray-500 text-sm mt-2">
                        Comments on videos will appear here once posted
                    </p>
                </div>

            /* Comments list */
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="bg-[#181818] border border-gray-800 rounded-xl p-6 hover:border-red-600/50 transition"
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex gap-4 flex-1 min-w-0">

                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                        {comment.userName?.charAt(0).toUpperCase() || <User size={16} />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {/* User info */}
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold text-white text-sm">
                                                {comment.userName || "Unknown User"}
                                            </p>
                                            <span className="text-gray-600">•</span>
                                            <p className="text-gray-500 text-xs truncate">
                                                {comment.userEmail}
                                            </p>
                                        </div>

                                        {/* Comment text */}
                                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line break-words">
                                            {comment.text}
                                        </p>

                                        {/* Video reference + date */}
                                        <div className="flex items-center gap-3 mt-3">
                                            {comment.videoId && (
                                                <Link
                                                    to={`/watch/${comment.videoId}`}
                                                    className="flex items-center gap-1.5 text-red-500 hover:text-red-400 text-xs font-medium transition"
                                                >
                                                    <PlayCircle size={13} />
                                                    {comment.videoTitle || "View Video"}
                                                </Link>
                                            )}
                                            <span className="text-gray-600 text-xs">
                                                {formatDate(comment.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Delete button */}
                                <button
                                    onClick={() => handleDelete(comment.id)}
                                    disabled={deletingId === comment.id}
                                    className="text-gray-500 hover:text-red-600 transition shrink-0 disabled:opacity-40 cursor-pointer"
                                    title="Delete comment"
                                >
                                    {deletingId === comment.id
                                        ? <Loader2 size={18} className="animate-spin" />
                                        : <Trash2 size={18} />
                                    }
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
