import apiClient from "../config/ApiClient";
import type { Video } from "../models/Video"; // Ya jahan bhi aapne Video model rakha hai

export const uploadVideo = async (file: File, title: string, description: string) => {
    // 1. File upload ke liye FormData zaroori hai
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);

    // 2. POST request with multipart header
    const response = await apiClient.post("/videos", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data;
};



export const getMyVideos = async (): Promise<Video[]> => {
    // User ke apne videos fetch karne ke liye
    const response = await apiClient.get("/videos/my-videos");
    return response.data;
};

export const getAllVideos = async (): Promise<Video[]> => {
    // Public feed ke liye
    const response = await apiClient.get("/videos");
    return response.data;
};

export const deleteVideo = async (videoId: string) => {
    // Video delete karne ke liye
    const response = await apiClient.delete(`/videos/${videoId}`);
    return response.data;
};

// HLS Master URL generate karne ka helper
export const getHlsMasterUrl = (videoId: string) => {
    return `${apiClient.defaults.baseURL}/videos/${videoId}/master.m3u8`;
};