// src/components/PracticeTab.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Box, Typography, Card, CardContent, CardMedia, CardActionArea,
  Chip, CircularProgress, Alert, Stack, Divider
} from '@mui/material'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'

import { Book, Lesson } from '../types'
import { normalizeText } from '../utils/textNormalizer'

const PracticeTab: React.FC = () => {


  const [books, setBooks] = useState<Book[]>([])
  const [loadingBooks, setLoadingBooks] = useState<boolean>(false)
  const [booksError, setBooksError] = useState<string | null>(null)

  const [activeBook, setActiveBook] = useState<Book | null>(null)
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)

  const navigate = useNavigate()

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoadingBooks(true)
        setBooksError(null)
        const res = await fetch('/api/admin/books')
        if (!res.ok) throw new Error('Failed to load books')
        const data: Book[] = await res.json()
        setBooks(data)
      } catch (err) {
        console.error(err)
        setBooksError('Unable to load books')
      } finally {
        setLoadingBooks(false)
      }
    }
    loadBooks()
  }, [])


  const handleSelectLesson = async (book: Book, lesson: Lesson) => {
    try {
      setActiveBook(book)
      setActiveLesson(lesson)

      const res = await fetch(`/books/${book.id}/${lesson.fileName}`)
      if (!res.ok) throw new Error('Failed to load lesson text')
      const text = await res.text()
      const normalized = normalizeText(text)

      // Navigate to session
      navigate('/session', {
        state: {
          text: normalized,
          book: book,
          lesson: lesson,
          nextLesson: getNextLesson(book, lesson),
          from: '/'
        }
      })

    } catch (err) {
      console.error(err)
    }
  }

  // Helper to determine next lesson
  function getNextLesson(book: Book, currentLesson: Lesson): Lesson | undefined {
    const sorted = [...book.lessons].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex(l => l.id === currentLesson.id)
    return sorted[idx + 1]
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="600" color="text.primary">
        Practice
      </Typography>

      <Box sx={{ mb: 6 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <LibraryBooksIcon color="primary" />
          <Typography variant="h6">Preloaded books</Typography>
        </Stack>

        {loadingBooks && <CircularProgress size={24} />}
        {booksError && <Alert severity="error">{booksError}</Alert>}
        {!loadingBooks && !booksError && books.length === 0 && (
          <Typography color="text.secondary">
            No books available yet. Add some from the Admin tab.
          </Typography>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
          {books.map(book => (
            <Card
              key={book.id}
              sx={{
                height: '100%',
                border: activeBook?.id === book.id ? 2 : 1,
                borderColor: activeBook?.id === book.id ? 'primary.main' : 'divider',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
            >
              <CardActionArea onClick={() => setActiveBook(book)} sx={{ height: '100%' }}>
                {book.thumbnailUrl && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={book.thumbnailUrl}
                    alt={book.title}
                  />
                )}
                <CardContent>
                  <Typography variant="h6" component="div" noWrap>
                    {book.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {book.description}
                  </Typography>
                  <Chip
                    label={`${book.lessons.length} lesson${book.lessons.length !== 1 ? 's' : ''}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>

        <AnimatePresence>
          {activeBook && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Box sx={{ mt: 3, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Lessons in <strong>{activeBook.title}</strong>
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {[...activeBook.lessons]
                    .sort((a, b) => a.order - b.order)
                    .map(lesson => (
                      <Chip
                        key={lesson.id}
                        label={`${lesson.order}. ${lesson.title}`}
                        onClick={() => void handleSelectLesson(activeBook, lesson)}
                        color={activeLesson?.id === lesson.id ? 'primary' : 'default'}
                        variant={activeLesson?.id === lesson.id ? 'filled' : 'outlined'}
                        clickable
                      />
                    ))}
                </Stack>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      <Divider sx={{ my: 4 }} />

      <AnimatePresence mode="wait">

      </AnimatePresence>
    </Box>
  )
}

export default PracticeTab
