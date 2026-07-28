import apiClient from "../config/ApiClient";
import type { Video } from "../models/Video";
import type UserT from "../models/User";

// Dashboard Stats
export const getDashboardStats = async () => {
  const response = await apiClient.get("/admin/dashboard");
  return response.data;
};

// Get All Users
export const getAllUsers = async (): Promise<UserT[]> => {
  const response = await apiClient.get("/admin/users");
  return response.data;
};

// Get User By Id
export const getUserById = async (userId: string): Promise<UserT> => {
  const response = await apiClient.get(`/admin/users/${userId}`);
  return response.data;
};

// Assign Admin Role
export const makeAdmin = async (userId: string) => {
  const response = await apiClient.post(
    `/admin/users/${userId}/assign-admin`
  );
  return response.data;
};

// Remove Admin Role — user wapas normal USER ban jayega
export const removeAdmin = async (userId: string) => {
  const response = await apiClient.delete(
    `/admin/users/${userId}/remove-admin`
  );
  return response.data;
};

// Delete User
export const deleteUser = async (userId: string) => {
  const response = await apiClient.delete(
    `/admin/users/${userId}`
  );
  return response.data;
};

// Get All Videos
export const getAllVideosAdmin = async (): Promise<Video[]> => {
  const response = await apiClient.get("/admin/videos");
  return response.data;
};

// Delete Video
export const deleteVideoAdmin = async (videoId: string) => {
  const response = await apiClient.delete(
    `/admin/videos/${videoId}`
  );
  return response.data;
};