import apiClient from "@/config/ApiClient";

export interface FeedbackItem {
    id: string;
    message: string;
    createdAt: string;
    userId: string;
    userName: string;
    userEmail: string;
}


export const submitFeedback = async (message: string): Promise<FeedbackItem> => {
    const response = await apiClient.post<FeedbackItem>("/feedback", { message });
    return response.data;
};

// Admin: saare feedbacks lo
export const getAllFeedbacks = async (): Promise<FeedbackItem[]> => {
    const response = await apiClient.get<FeedbackItem[]>("/admin/feedbacks");
    return response.data;
};

// Admin: ek feedback delete karo
export const deleteFeedbackAdmin = async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/feedbacks/${id}`);
};
