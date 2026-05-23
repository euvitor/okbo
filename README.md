# okbo.
> bookfinder + bookshelf — find books, save your reads.

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)

## 📖 About
**okbo** is a web app for searching and discovering books using the Google Books API. The goal is to evolve into a personal bookshelf — where you can track what you've read, are reading, or want to read.

Built as a fullstack portfolio project, with a focus on clean architecture, typed data contracts, and a thoughtful UI.

## ✨ Features
- Search books by title, author, ISBN or subject via Google Books API
- Filter by language and print type
- View individual book details (cover, synopsis, page count, ISBN, rating)
- URL-based navigation — searches are shareable links
- Typed API responses with a custom adapter pattern
- Responsive layout with Tailwind CSS

## 🚧 Planned (Phase 2)
- [ ] Authentication with Supabase Auth (login/signup)
- [ ] Personal bookshelf with reading status (reading, read, want to read)
- [ ] Save, edit and review books
- [ ] Protected routes for shelf access

## 🛠️ Tech Stack
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| TypeScript 6 | Type safety |
| Tailwind CSS 4 | Styling |
| Vite 8 | Build tool |
| React Router DOM 7 | Client-side routing |
| Google Books API | Book data source |
| Lucide React | Icons |
| Supabase *(planned)* | Auth + database (Phase 2) |

## 📁 Project Structure
```text
src/ 
  components/ # Reusable UI components (SearchBar, BookCard, ...) 
  pages/      # Route pages (Home, SearchResults, BookDetails) 
  services/   # API integration + adapter (googleBooks.ts) 
  types/      # TypeScript interfaces (Book, GoogleBooksResponse, SearchFilters) 
  utils/      # Generic helpers
```

## 🏗️ Architecture
Data flows from Google Books API through a typed adapter before reaching any component:

```text
User input → SearchBar → /search?q=... 
                              ↓ 
                        SearchResults 
                              ↓ 
                     googleBooks service 
                              ↓ 
                      adaptGoogleBook() → Book 
                                            ↓ 
                                         BookCard 
                                            ↓ 
                                       /book/:id → BookDetails
```

`Book` is the internal contract — components never consume raw API types directly.

## 🚀 Getting Started

### 📋 Prerequisites
- Node.js 18+
- A [Google Books API key](https://developers.google.com/books/docs/v1/using#APIKey)

### ⚙️ Installation
```bash
git clone [https://github.com/euvitor/okbo.git](https://github.com/euvitor/okbo.git)
cd okbo
npm install
echo "VITE_GOOGLE_BOOKS_API_KEY=your_api_key_here" > .env
npm run dev
```

## 📄 License
MIT — see LICENSE for details.

Made by euvitor