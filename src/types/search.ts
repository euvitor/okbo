export type SearchField = "all" | "title" | "author" | "isbn" | "subject";
export type OrderBy = "relevance" | "newest";

export interface SearchFilters {
  field: SearchField;
  lang?: "pt" | "en";
  genre?: string;
}
