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
            small?: string;
            medium?: string;
            large?: string;
            extraLarge?: string;
        };
        industryIdentifiers?: {
            type: string;
            identifier: string;
        }[];
        averageRating?: number;
        ratingsCount?: number;
        categories?: string[];
    };
}


export interface GoogleBooksResponse {
    items?: GoogleBooksVolume[];
    totalItems?: number;
}