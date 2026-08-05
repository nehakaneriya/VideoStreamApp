export interface ScrollResponse<T> {
    content: T[];
    scrollId: string | null;
    hasNext: boolean;
    pageSize: number;
}