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
  // BASE_URL 在 dev 下为 '/'，生产构建下为 '/mingli-research/'，首尾斜杠处理即可
  const coverSrc = book.cover
    ? `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${book.cover.replace(/^\/+/, '')}`
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
