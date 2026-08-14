import apiClient from "../config/ApiClient";
import type { Category } from "../models/Category";

// Public: saari categories (Home filter chips + upload dropdown ke liye)
export const getAllCategories = async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>("/categories");
    return response.data;
};

// Admin: nayi category add karo
export const createCategory = async (data: { name: string; description?: string }): Promise<Category> => {
    const response = await apiClient.post<Category>("/admin/categories", data);
    return response.data;
};

// Admin: category delete karo — uske videos 'other' me move ho jayenge
export const deleteCategory = async (id: string): Promise<{ message: string; movedVideos: number }> => {
    const response = await apiClient.delete<{ message: string; movedVideos: number }>(`/admin/categories/${id}`);
    return response.data;
};
