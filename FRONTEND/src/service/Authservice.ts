import type RegisterData from "@/models/RegisterData"
import apiClient from "@/config/ApiClient"; 
import type LoginData from "@/models/LoginData";
import type LoginResponseData from "@/models/LoginResponseData";
import type UserT from "@/models/User";

// Register User
export const registerUser=async(signupData: RegisterData)=>{
    const response = await apiClient.post('/auth/register',signupData);  
    return response.data;
};

// Verify Email OTP
export const verifyOtp = async (email: string, otp: string) => {
    const response = await apiClient.post<{ message: string }>('/auth/verify-otp', { email, otp });
    return response.data;
};

// Resend Email OTP (60 sec cooldown)
export const resendOtp = async (email: string) => {
    const response = await apiClient.post<{ message: string }>('/auth/resend-otp', { email });
    return response.data;
};

// Login User (normal user)
export const loginUser = async(loginData:LoginData)=>{
    const response = await apiClient.post<LoginResponseData>('/auth/login',loginData);  
    return response.data;
};

// Logout User (normal user)
export const logoutUser = async() => {
    const response = await apiClient.post('/auth/logout');  
    return response.data;
};

// Get current login user
export const getCurrentUser = async(emailId: string | undefined) => {
    const response = await apiClient.get<UserT>(`/users/email/${emailId}`);  
    return response.data;
}

// Verify current session — 401 aaye to user deleted/invalid hai
export const verifySession = async(): Promise<UserT> => {
    const response = await apiClient.get<UserT>('/auth/me');
    return response.data;
}

// Refresh Access Token (normal user)
export const refreshToken = async() => {
    const response = await apiClient.post<LoginResponseData>('/auth/refresh');  
    return response.data;
}

// Update User Profile — name aur/ya password update karo
export const updateUserProfile = async (
    userId: string,
    data: { name?: string; password?: string }
): Promise<UserT> => {
    const response = await apiClient.put<UserT>(`/users/${userId}`, data);
    return response.data;
};

// ===== ADMIN AUTH — Alag endpoints, alag cookie =====

// Admin Login
export const adminLoginApi = async(loginData: LoginData) => {
    const response = await apiClient.post<LoginResponseData>('/auth/admin/login', loginData);
    return response.data;
};

// Admin Refresh Token
export const adminRefreshToken = async() => {
    const response = await apiClient.post<LoginResponseData>('/auth/admin/refresh');
    return response.data;
};

// Admin Logout
export const adminLogoutApi = async() => {
    const response = await apiClient.post('/auth/admin/logout');
    return response.data;
};

