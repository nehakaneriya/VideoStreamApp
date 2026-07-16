import { useEffect, useState } from "react";
import { MessageSquare, Trash2, Loader2, User } from "lucide-react";
import { getAllFeedbacks, deleteFeedbackAdmin, type FeedbackItem } from "@/service/FeedbackService";
import { toast } from "react-toastify";

export default function AdminFeedback() {
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await getAllFeedbacks();
                setFeedbacks(data);
            } catch {
                toast.error("Failed to load feedbacks");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this feedback?")) return;
        try {
            setDeletingId(id);
            await deleteFeedbackAdmin(id);
            setFeedbacks((prev) => prev.filter((f) => f.id !== id));
            toast.success("Feedback deleted");
        } catch {
            toast.error("Failed to delete feedback");
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
                    <span className="text-red-600">User</span> Feedback
                </h1>
                {!loading && (
                    <span className="text-sm text-gray-400 bg-[#181818] border border-gray-700 px-3 py-1 rounded-full">
                        {feedbacks.length} total
                    </span>
                )}
            </div>

            {/* Loading */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 size={36} className="animate-spin text-red-600" />
                </div>

            /* Empty */
            ) : feedbacks.length === 0 ? (
                <div className="bg-[#181818] border border-gray-800 rounded-xl p-16 text-center">
                    <MessageSquare size={52} className="text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg font-medium">No feedbacks yet</p>
                    <p className="text-gray-500 text-sm mt-2">
                        User feedbacks will appear here once submitted
                    </p>
                </div>

            /* Feedback list */
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {feedbacks.map((feedback) => (
                        <div
                            key={feedback.id}
                            className="bg-[#181818] border border-gray-800 rounded-xl p-6 hover:border-red-600/50 transition"
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex gap-4 flex-1 min-w-0">

                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                        {feedback.userName?.charAt(0).toUpperCase() || <User size={16} />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {/* User info */}
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold text-white text-sm">
                                                {feedback.userName || "Unknown User"}
                                            </p>
                                            <span className="text-gray-600">•</span>
                                            <p className="text-gray-500 text-xs truncate">
                                                {feedback.userEmail}
                                            </p>
                                        </div>

                                        {/* Message */}
                                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                                            {feedback.message}
                                        </p>

                                        {/* Date */}
                                        <p className="text-gray-600 text-xs mt-3">
                                            {formatDate(feedback.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {/* Delete button */}
                                <button
                                    onClick={() => handleDelete(feedback.id)}
                                    disabled={deletingId === feedback.id}
                                    className="text-gray-500 hover:text-red-600 transition shrink-0 disabled:opacity-40 cursor-pointer"
                                    title="Delete feedback"
                                >
                                    {deletingId === feedback.id
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
