export interface Comment {
    id: string;
    text: string;
    createdAt: string;
    videoId: string;
    videoTitle?: string;
    userId?: string;
    userName?: string;
    userEmail?: string;
    parentCommentId?: string | null;
    replies?: Comment[];
}
