import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Book } from '../types'

interface NewLessonDraft {
  title: string
  content: string
}

const emptyLesson: NewLessonDraft = { title: '', content: '' }

const AdminTab: React.FC = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [lessons, setLessons] = useState<NewLessonDraft[]>([{ ...emptyLesson }])
  const [isSaving, setIsSaving] = useState(false)
  const [books, setBooks] = useState<Book[]>([])
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)

  const [editingBook, setEditingBook] = useState<Book | null>(null)

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const res = await fetch('/api/admin/books')
        if (!res.ok) throw new Error('Failed to load books')
        const data: Book[] = await res.json()
        setBooks(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadBooks()
  }, [])

  const handleLessonChange = (index: number, field: keyof NewLessonDraft, value: string) => {
    setLessons(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const addLessonRow = () => {
    setLessons(prev => [...prev, { ...emptyLesson }])
    setCurrentLessonIndex(prev => prev + 1)
  }

  const removeLessonRow = (index: number) => {
    setLessons(prev => {
      const newLessons = prev.filter((_, i) => i !== index)
      // Safety check: if we removed the last item and index was last, decrement
      // If we remove the only item, we might want to ensure at least one empty lesson exists (based on reqs),
      // but current logic allowed empty list temporarily or logic elsewhere handles it.
      // Actually original logic allowed removing the only lesson? 
      // Original: setLessons(prev => prev.filter((_, i) => i !== index))
      // But button is only shown if lessons.length > 1. So we are safe.

      return newLessons
    })
    if (index === lessons.length - 1 && index > 0) {
      setCurrentLessonIndex(prev => prev - 1)
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setThumbnail(file)
  }

  const handleSaveBook = async () => {
    if (!title.trim()) return
    if (!lessons.some(l => l.title.trim() && l.content.trim())) return

    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      if (thumbnail) formData.append('thumbnail', thumbnail)
      formData.append('lessons', JSON.stringify(lessons))

      const res = await fetch('/api/admin/books', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || 'Failed to save book')
      }

      const saved: Book = await res.json()
      setBooks(prev => [...prev, saved])
      resetForm()
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Failed to save book')
    } finally {
      setIsSaving(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setThumbnail(null)
    setLessons([{ ...emptyLesson }])
    setEditingBook(null)
    setCurrentLessonIndex(0)
  }

  const handleEditBook = async (book: Book) => {
    setEditingBook(book)
    setTitle(book.title)
    setDescription(book.description)
    setCurrentLessonIndex(0)
    // Set placeholder while fetching
    setLessons(book.lessons.map(l => ({ title: l.title, content: 'Loading...' })))

    try {
      const lessonsWithContent = await Promise.all(book.lessons.map(async (l) => {
        let content = ''
        if (l.fileName) {
          try {
            const res = await fetch(`/books/${book.id}/${l.fileName}`)
            if (res.ok) {
              content = await res.text()
            } else {
              content = 'Error loading content.'
            }
          } catch (e) {
            console.error(`Failed to load content for lesson ${l.title}`, e)
            content = 'Error loading content.'
          }
        }
        return {
          title: l.title,
          content: content
        }
      }))
      setLessons(lessonsWithContent)
    } catch (error) {
      console.error("Error fetching lesson details", error)
    }
  }

  const handleUpdateBook = async () => {
    if (!editingBook || !title.trim()) return
    if (!lessons.some(l => l.title.trim())) return

    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('bookId', editingBook.id)
      if (thumbnail) formData.append('thumbnail', thumbnail)
      formData.append('lessons', JSON.stringify(lessons))

      const res = await fetch(`/api/admin/books/${editingBook.id}`, {
        method: 'PUT',
        body: formData
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || 'Failed to update book')
      }

      const updated: Book = await res.json()
      setBooks(prev => prev.map(b => b.id === updated.id ? updated : b))
      resetForm()
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Failed to update book')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('Delete this book and all lessons?')) return

    try {
      const res = await fetch(`/api/admin/books/${bookId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete book')
      setBooks(prev => prev.filter(b => b.id !== bookId))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>Admin – Manage books & lessons</h2>

      <div className="admin-grid">
        <section className="admin-form">
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <h3>{editingBook ? 'Edit book' : 'New book'}</h3>
            {editingBook && (
              <button
                type="button"
                className="chip-button chip-danger"
                onClick={resetForm}
                style={{ alignSelf: 'center' }}
              >
                Cancel edit
              </button>
            )}
          </div>

          <div className="form-group">
            <label>Book title</label>
            <input
              className="text-input"
              style={{ minHeight: 'auto', padding: '0.75rem 1rem' }}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Touch Typing Fundamentals"
            />
          </div>

          <div className="form-group">
            <label>Short description</label>
            <textarea
              className="text-input"
              style={{ minHeight: 80 }}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="A short blurb shown on the home page."
            />
          </div>

          <div className="form-group">
            <label>Thumbnail (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label>Lesson {currentLessonIndex + 1} of {lessons.length}</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="chip-button"
                  disabled={currentLessonIndex === 0}
                  onClick={() => setCurrentLessonIndex(prev => prev - 1)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="chip-button"
                  disabled={currentLessonIndex === lessons.length - 1}
                  onClick={() => setCurrentLessonIndex(prev => prev + 1)}
                >
                  Next
                </button>
              </div>
            </div>

            <div className="lessons-list">
              <div className="lesson-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Current Lesson
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {lessons.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLessonRow(currentLessonIndex)}
                        className="chip-button chip-danger"
                      >
                        Remove
                      </button>
                    )}
                    <button type="button" className="chip-button" onClick={addLessonRow}>
                      + New
                    </button>
                  </div>
                </div>
                <input
                  className="text-input"
                  style={{ minHeight: 'auto', padding: '0.5rem 0.75rem', marginBottom: '0.5rem' }}
                  placeholder="Lesson title"
                  value={lessons[currentLessonIndex]?.title || ''}
                  onChange={e => handleLessonChange(currentLessonIndex, 'title', e.target.value)}
                />
                <textarea
                  className="text-input"
                  style={{ minHeight: 120 }}
                  placeholder="Lesson text (what typists will type)"
                  value={lessons[currentLessonIndex]?.content || ''}
                  onChange={e => handleLessonChange(currentLessonIndex, 'content', e.target.value)}
                />
              </div>
            </div>
          </div>

          <motion.button
            className="button"
            onClick={editingBook ? handleUpdateBook : handleSaveBook}
            disabled={isSaving}
            whileHover={{ scale: isSaving ? 1 : 1.02 }}
            whileTap={{ scale: isSaving ? 1 : 0.98 }}
          >
            {isSaving ? 'Saving…' : editingBook ? 'Update book' : 'Save new book'}
          </motion.button>
        </section>

        <section className="admin-preview">
          <h3 style={{ marginBottom: '0.75rem' }}>Existing books</h3>

          <div className="books-grid">
            {books.map(book => (
              <div key={book.id} className="book-card">
                {book.thumbnailUrl && (
                  <div className="book-thumb">
                    <img src={book.thumbnailUrl} alt={book.title} />
                  </div>
                )}
                <h4>{book.title}</h4>
                <p>{book.description}</p>
                <span className="book-meta">
                  {book.lessons.length} lesson{book.lessons.length !== 1 ? 's' : ''}
                </span>
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="chip-button"
                    onClick={() => handleEditBook(book)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="chip-button chip-danger"
                    onClick={() => handleDeleteBook(book.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminTab
