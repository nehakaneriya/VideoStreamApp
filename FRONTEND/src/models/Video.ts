export interface Video {
    videoId: string;
    title: string;
    description: string;
    contentType: string;
    filePath: string;
    createdAt?: string;
    // Backend se flat fields aate hain
    userId?: string;
    userName?: string;
    userEmail?: string;
}

export interface VideoUploadRequest {
    title: string;
    description: string;
    file: File;
}