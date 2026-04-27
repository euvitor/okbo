# okbo.

> bookfinder + bookshelf — find books, save your reads.

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)

## About

**okbo** is a web app for searching and discovering books using the Google Books API. The goal is to evolve into a personal bookshelf — where you can track what you've read, are reading, or want to read.

The project is built with a focus on clean architecture, typed data, and a minimal UI.

## Features

- Search books by title, author or keyword via Google Books API
- View individual book details (cover, synopsis, page count, ISBN, rating)
- URL-based navigation with React Router
- Responsive layout with Tailwind CSS
- Typed API responses with custom adapter pattern

## Planned (Phase 2)

- [ ] Authentication (login/signup)
- [ ] Personal bookshelf (reading, read, want to read)
- [ ] Save and manage your reading list

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| TypeScript | Type safety |
| Tailwind CSS 4 | Styling |
| Vite | Build tool |
| React Router DOM | Client-side routing |
| Google Books API | Book data source |
| Lucide React | Icons |

## Project Structure

```
src/
  components/     # Reusable UI components (SearchBar, ...)
  pages/          # Route pages (Home, BookDetails)
  services/       # API integration (googleBooks.ts)
  types/          # TypeScript interfaces (Book, GoogleBooksResponse)
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Google Books API key](https://developers.google.com/books/docs/v1/using#APIKey)

### Installation

```bash
# Clone the repository
git clone https://github.com/euvitor/okbo.git
cd okbo

# Install dependencies
npm install

# Create your .env file
echo "VITE_GOOGLE_BOOKS_API_KEY=your_api_key_here" > .env

# Start the dev server
npm run dev
```

## License

MIT — see [LICENSE](./LICENSE) for details.

---

Made by [euvitor](https://github.com/euvitor)
