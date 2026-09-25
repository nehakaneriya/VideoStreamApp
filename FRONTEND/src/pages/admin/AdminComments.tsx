import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Trash2, Loader2, User, PlayCircle, EyeOff, Eye, CornerDownRight, MessageSquare } from "lucide-react";
import { getAllCommentsAdmin, deleteCommentAdmin, hideCommentAdmin, unhideCommentAdmin } from "@/service/CommentService";
import type { Comment } from "@/models/Comment";
import { toast } from "react-toastify";

type FilterTab = "ALL" | "PARENT" | "CHILD" | "HIDDEN";

export default function AdminComments() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [hidingId, setHidingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<FilterTab>("ALL");

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

    // Comment hide ya unhide karo (Parent ho ya Child reply)
    const handleToggleHide = async (comment: Comment) => {
        try {
            setHidingId(comment.id);
            if (comment.hidden) {
                const updated = await unhideCommentAdmin(comment.id);
                setComments((prev) =>
                    prev.map((c) => (c.id === comment.id ? { ...c, hidden: updated.hidden } : c))
                );
                toast.success("Comment is now visible to public");
            } else {
                const updated = await hideCommentAdmin(comment.id);
                setComments((prev) =>
                    prev.map((c) => (c.id === comment.id ? { ...c, hidden: updated.hidden } : c))
                );
                toast.success("Comment hidden from public view");
            }
        } catch {
            toast.error("Failed to update comment visibility");
        } finally {
            setHidingId(null);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Filter calculations
    const parentCount = useMemo(() => comments.filter((c) => !c.parentCommentId).length, [comments]);
    const childCount = useMemo(() => comments.filter((c) => !!c.parentCommentId).length, [comments]);
    const hiddenCount = useMemo(() => comments.filter((c) => c.hidden).length, [comments]);

    const filteredComments = useMemo(() => {
        switch (activeTab) {
            case "PARENT":
                return comments.filter((c) => !c.parentCommentId);
            case "CHILD":
                return comments.filter((c) => !!c.parentCommentId);
            case "HIDDEN":
                return comments.filter((c) => c.hidden);
            case "ALL":
            default:
                return comments;
        }
    }, [comments, activeTab]);

    return (
        <div className="p-2">
            {/* Header */}
            <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">
                        <span className="text-red-600">Video</span> Comments 
                    </h1>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1">
                        Manage, hide, or delete inappropriate parent comments and child replies
                    </p>
                </div>
            </div>

            {/* Filter Tabs */}
            {!loading && (
                <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-800 pb-3">
                    <button
                        onClick={() => setActiveTab("ALL")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                            activeTab === "ALL"
                                ? "bg-red-600 text-white"
                                : "bg-[#181818] text-gray-400 hover:text-white border border-gray-800"
                        }`}
                    >
                        All ({comments.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("PARENT")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                            activeTab === "PARENT"
                                ? "bg-red-600 text-white"
                                : "bg-[#181818] text-gray-400 hover:text-white border border-gray-800"
                        }`}
                    >
                        <MessageSquare size={13} />
                        Parent Comments ({parentCount})
                    </button>
                    <button
                        onClick={() => setActiveTab("CHILD")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                            activeTab === "CHILD"
                                ? "bg-red-600 text-white"
                                : "bg-[#181818] text-gray-400 hover:text-white border border-gray-800"
                        }`}
                    >
                        <CornerDownRight size={13} />
                        Replies / Child ({childCount})
                    </button>
                    <button
                        onClick={() => setActiveTab("HIDDEN")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                            activeTab === "HIDDEN"
                                ? "bg-yellow-600 text-white"
                                : "bg-[#181818] text-yellow-500 hover:text-yellow-400 border border-yellow-800/40"
                        }`}
                    >
                        <EyeOff size={13} />
                        Hidden Comments ({hiddenCount})
                    </button>
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 size={36} className="animate-spin text-red-600" />
                </div>
            ) : filteredComments.length === 0 ? (
                /* Empty */
                <div className="bg-[#181818] border border-gray-800 rounded-xl p-16 text-center">
                    <MessageCircle size={52} className="text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg font-medium">No comments found</p>
                    <p className="text-gray-500 text-sm mt-2">
                        {activeTab === "HIDDEN"
                            ? "No comments are currently hidden."
                            : activeTab === "CHILD"
                            ? "No child comment replies yet."
                            : "Comments on videos will appear here once posted"}
                    </p>
                </div>
            ) : (
                /* Comments list */
                <div className="grid grid-cols-1 gap-4">
                    {filteredComments.map((comment) => {
                        const isChild = !!comment.parentCommentId;

                        return (
                            <div
                                key={comment.id}
                                className={`border rounded-xl p-5 transition ${
                                    comment.hidden
                                        ? "bg-[#141414] border-yellow-700/50 opacity-80"
                                        : isChild
                                        ? "bg-[#161616] border-gray-800/80 hover:border-blue-600/40"
                                        : "bg-[#181818] border-gray-800 hover:border-red-600/50"
                                }`}
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex gap-3.5 flex-1 min-w-0">
                                        {/* Avatar */}
                                        <div
                                            className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${
                                                isChild ? "bg-blue-600" : "bg-red-600"
                                            }`}
                                        >
                                            {comment.userName?.charAt(0).toUpperCase() || <User size={15} />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            {/* User info + Tags */}
                                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                <p className="font-semibold text-white text-sm">
                                                    {comment.userName || "Unknown User"}
                                                </p>
                                                <span className="text-gray-600">•</span>
                                                <p className="text-gray-500 text-xs truncate max-w-[200px]">
                                                    {comment.userEmail}
                                                </p>

                                                {/* Parent or Child Tag */}
                                                {isChild ? (
                                                    <span className="text-[11px] font-medium text-blue-400 bg-blue-500/10 border border-blue-600/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <CornerDownRight size={10} />
                                                        Child Reply
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] font-medium text-gray-400 bg-gray-500/10 border border-gray-600/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <MessageSquare size={10} />
                                                        Parent Comment
                                                    </span>
                                                )}

                                                {/* Hidden Tag */}
                                                {comment.hidden && (
                                                    <span className="text-[11px] font-semibold text-yellow-500 bg-yellow-500/10 border border-yellow-600/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <EyeOff size={10} />
                                                        Hidden from Public
                                                    </span>
                                                )}
                                            </div>

                                            {/* Comment text */}
                                            <p
                                                className={`text-sm leading-relaxed whitespace-pre-line break-words ${
                                                    comment.hidden ? "text-gray-400 italic" : "text-gray-200"
                                                }`}
                                            >
                                                {comment.text}
                                            </p>

                                            {/* Video reference + date */}
                                            <div className="flex items-center gap-3 mt-3 flex-wrap">
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

                                    {/* Action buttons: Hide/Unhide + Delete */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        {/* Hide / Unhide toggle button */}
                                        <button
                                            onClick={() => handleToggleHide(comment)}
                                            disabled={hidingId === comment.id}
                                            className={`p-1.5 rounded-lg transition cursor-pointer disabled:opacity-40 ${
                                                comment.hidden
                                                    ? "text-yellow-500 hover:text-yellow-300 hover:bg-yellow-950/30"
                                                    : "text-gray-500 hover:text-yellow-500 hover:bg-gray-800"
                                            }`}
                                            title={
                                                comment.hidden
                                                    ? `Unhide this ${isChild ? "child reply" : "comment"}`
                                                    : `Hide this ${isChild ? "child reply" : "comment"} from public`
                                            }
                                        >
                                            {hidingId === comment.id ? (
                                                <Loader2 size={18} className="animate-spin" />
                                            ) : comment.hidden ? (
                                                <Eye size={18} />
                                            ) : (
                                                <EyeOff size={18} />
                                            )}
                                        </button>

                                        {/* Delete button */}
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            disabled={deletingId === comment.id}
                                            className="text-gray-500 hover:text-red-600 transition p-1.5 rounded-lg hover:bg-gray-800 shrink-0 disabled:opacity-40 cursor-pointer"
                                            title={`Delete this ${isChild ? "child reply" : "comment"} permanently`}
                                        >
                                            {deletingId === comment.id ? (
                                                <Loader2 size={18} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={18} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
