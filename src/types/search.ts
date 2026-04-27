export type SearchField = 'all' | 'title' | 'author' | 'isbn' | 'subject'
export type PrintType = 'all' | 'books' | 'magazines'
export type OrderBy = 'relevance' | 'newest'

export interface SearchFilters {
    field: SearchField
    lang?: 'pt' | 'en'
    printType?: PrintType
}