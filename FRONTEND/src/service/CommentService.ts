import apiClient from "@/config/ApiClient";
import type { Comment } from "@/models/Comment";

// Video ke saare comments lo (public — login zaroori nahi)
export const getComments = async (videoId: string): Promise<Comment[]> => {
    const response = await apiClient.get<Comment[]>(`/videos/${videoId}/comments`);
    return response.data;
};

// Naya comment post karo (login zaroori)
// parentCommentId diya to ye kisi comment ka reply banega
export const postComment = async (
    videoId: string,
    text: string,
    parentCommentId?: string
): Promise<Comment> => {
    const response = await apiClient.post<Comment>(`/videos/${videoId}/comments`, {
        text,
        parentCommentId: parentCommentId ?? null,
    });
    return response.data;
};

// Comment delete karo — sirf apna, ya admin kisi ka bhi
export const deleteComment = async (commentId: string): Promise<void> => {
    await apiClient.delete(`/comments/${commentId}`);
};

// ── ADMIN ────────────────────────────────────────────────────────────────

// Admin: poore platform ke saare comments lo (moderation ke liye)
export const getAllCommentsAdmin = async (): Promise<Comment[]> => {
    const response = await apiClient.get<Comment[]>("/admin/comments");
    return response.data;
};

// Admin: kisi bhi comment ko force delete karo
export const deleteCommentAdmin = async (commentId: string): Promise<void> => {
    await apiClient.delete(`/admin/comments/${commentId}`);
};
