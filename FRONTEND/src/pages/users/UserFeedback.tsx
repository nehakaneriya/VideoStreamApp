import { useState } from "react";
import { MessageSquare, Send, CheckCircle, Loader2 } from "lucide-react";
import { submitFeedback } from "@/service/FeedbackService";
import { toast } from "react-toastify";
import axios from "axios";

export default function UserFeedback() {
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const MAX_CHARS = 1000;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim()) {
            toast.error("Please write something before submitting");
            return;
        }

        try {
            setSubmitting(true);
            await submitFeedback(message.trim());
            setSubmitted(true);
            setMessage("");
            toast.success("Feedback submitted! Thank you 🙏");
        } catch (error) {
            const msg =
                axios.isAxiosError(error) && error.response?.data?.message
                    ? error.response.data.message
                    : "Failed to submit feedback. Please try again.";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white flex justify-center px-6 py-16">
            <div className="w-full max-w-2xl">

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <MessageSquare size={32} className="text-red-600" />
                    <div>
                        <h1 className="text-3xl font-bold">
                            Send <span className="text-red-600">Feedback</span>
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">
                            We value your feedback. Let us know your thoughts!
                        </p>
                    </div>
                </div>

                {/* Success State */}
                {submitted ? (
                    <div className="bg-[#181818] border border-green-600/40 rounded-2xl p-10 text-center">
                        <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">
                            Feedback Received!
                        </h2>
                        <p className="text-gray-400 mb-6">
                            Thank you for your feedback. We'll look into it.
                        </p>
                        <button
                            onClick={() => setSubmitted(false)}
                            className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-full transition text-sm font-medium cursor-pointer"
                        >
                            Send Another
                        </button>
                    </div>
                ) : (
                    /* Feedback Form */
                    <form
                        onSubmit={handleSubmit}
                        className="bg-[#181818] border border-gray-800 rounded-2xl p-8"
                    >
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Your Feedback
                            </label>
                            <textarea
                                rows={7}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={submitting}
                                maxLength={MAX_CHARS}
                                placeholder="Write your feedback here..."
                                className="w-full p-4 bg-[#0f0f0f] border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition resize-none disabled:opacity-50"
                            />
                            {/* Character counter */}
                            <div className="flex justify-end mt-1">
                                <span className={`text-xs ${
                                    message.length > MAX_CHARS * 0.9
                                        ? "text-red-500"
                                        : "text-gray-500"
                                }`}>
                                    {message.length} / {MAX_CHARS}
                                </span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || !message.trim()}
                            className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Submit Feedback
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
