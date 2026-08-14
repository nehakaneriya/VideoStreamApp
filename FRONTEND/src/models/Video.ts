export interface Video {
    videoId: string;
    title: string;
    description: string;
    contentType: string;
    category?: string;
    filePath: string;
    viewCount?: number;
    createdAt?: string;
    // Backend se flat fields aate hain
    userId?: string;
    userName?: string;
    userEmail?: string;
    // Admin panel ke liye — video pe total comments
    commentCount?: number;
}

export interface VideoUploadRequest {
    title: string;
    description: string;
    category?: string;
    file: File;
}