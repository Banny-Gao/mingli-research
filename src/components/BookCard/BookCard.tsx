import { Link } from 'react-router-dom'
import type { Book } from '../../data/book-types'
import './BookCard.less'

interface BookCardProps {
  book: Book
}

const progressPercent = (done: number, total: number) =>
  total > 0 ? Math.round((done / total) * 100) : 0

const BookCard = ({ book }: BookCardProps) => {
  const pct = progressPercent(book.done, book.total)
  // 用 new URL 拼接避免双斜杠问题（BASE_URL 末尾有无 / 都能正确处理）
  const coverSrc = book.cover
    ? new URL(book.cover.replace(/^\/+/, ''), import.meta.env.BASE_URL).toString()
    : ''

  return (
    <Link to={`/books/${book.section}/${book.slug}`} className="book-card book-card--with-cover">
      <div className="book-card-cover">
        {coverSrc ? (
          <img src={coverSrc} alt={`《${book.title}》封面`} loading="lazy" />
        ) : (
          <div className="book-card-cover-placeholder">
            <span className="book-card-cover-placeholder-title">{book.title}</span>
          </div>
        )}
      </div>
      <div className="book-card-body">
        <div className="book-card-info">
          <h2 className="book-card-title">《{book.title}》</h2>
          <p className="book-card-meta">{book.author || ''}</p>
        </div>
        {book.description && <p className="book-card-desc">{book.description}</p>}
        <div className="book-card-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="book-card-progress-label">{pct}%</span>
        </div>
      </div>
    </Link>
  )
}

export default BookCard
