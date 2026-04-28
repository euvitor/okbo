export interface GoogleBooksVolume {
    id: string;
    volumeInfo?: {
        title?: string;
        subtitle?: string;
        authors?: string[];
        description?: string;
        pageCount?: number;
        publishedDate?: string;
        imageLinks?: {
            smallThumbnail?: string;
            thumbnail?: string;
        };
        industryIdentifiers?: {
            type: string;
            identifier: string;
        }[];
        averageRating?: number;
        categories?: string[];
    };
}


export interface GoogleBooksResponse {
    items?: GoogleBooksVolume[];
}