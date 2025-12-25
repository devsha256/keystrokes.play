import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { randomUUID } from 'crypto'
import sharp from 'sharp'

const app = express()
const PORT = 5001

app.use(cors({
  origin: 'http://localhost:3000'
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Serve static books folder FIRST (before other routes)
app.use('/books', express.static(path.join(__dirname, 'books'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.txt')) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    }
  }
}))

// Multer config
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, 'books')),
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`)
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
})

// Data types
type SavedLesson = {
  id: string
  title: string
  order: number
  fileName: string
}

type SavedBook = {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  createdAt: string
  updatedAt: string
  lessons: SavedLesson[]
}

const dataFile = path.join(__dirname, 'books', 'books.json')

// Data persistence
const loadBooks = (): SavedBook[] => {
  try {
    if (!fs.existsSync(dataFile)) return []
    const raw = fs.readFileSync(dataFile, 'utf-8')
    return JSON.parse(raw) as SavedBook[]
  } catch {
    return []
  }
}

const saveBooks = (books: SavedBook[]) => {
  const dir = path.dirname(dataFile)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(dataFile, JSON.stringify(books, null, 2), 'utf-8')
}

// Generate card-style thumbnail
const generateCardThumbnail = async (
  inputPath: string,
  outputPath: string,
  width: number = 400,
  height: number = 250
): Promise<void> => {
  // Resize the user's uploaded image to fit inside the card
  const resizedImageBuffer = await sharp(inputPath)
    .resize(Math.round(width * 0.8), Math.round(height * 0.8), {
      fit: 'inside',
      withoutEnlargement: true
    })
    .toBuffer()

  // Use the SVG background as the base image
  await sharp(Buffer.from(
    `<svg width="${width}" height="${height}">
        <rect width="100%" height="100%" rx="12" fill="#1a1f3a"/>
        <rect x="10" y="10" width="${width - 20}" height="${height - 20}" rx="8" fill="#0a0e27" opacity="0.3"/>
        <rect x="10" y="10" width="${width - 20}" height="${height - 20}" rx="8" stroke="#6366f1" stroke-width="1" fill="none"/>
      </svg>`
  ))
    .composite([{
      input: resizedImageBuffer,
      gravity: 'center'
    }])
    .jpeg({ quality: 90 })
    .toFile(outputPath)
}

// GET all books
app.get('/api/admin/books', (_req, res) => {
  const books = loadBooks()
  res.json(books)
})

// POST new book
app.post('/api/admin/books', upload.single('thumbnail'), async (req, res) => {
  try {
    const { title, description } = req.body
    const lessonsRaw = req.body.lessons

    if (!title || !lessonsRaw) {
      return res.status(400).json({ message: 'Missing title or lessons' })
    }

    const lessonsInput: { title: string; content: string }[] = JSON.parse(lessonsRaw)
    const validLessons = lessonsInput
      .map((l, index) => ({
        title: (l.title || '').trim(),
        content: (l.content || '').trim(),
        order: index + 1
      }))
      .filter(l => l.title && l.content)

    if (validLessons.length === 0) {
      return res.status(400).json({ message: 'At least one valid lesson required' })
    }

    const bookId = randomUUID()
    const bookDir = path.join(__dirname, 'books', bookId)
    if (!fs.existsSync(bookDir)) fs.mkdirSync(bookDir, { recursive: true })

    // Handle thumbnail - Generate card-style thumbnail
    let thumbnailUrl: string | undefined
    if (req.file) {
      const cardThumbPath = path.join(bookDir, 'cover-card.jpg')

      // Generate card thumbnail
      await generateCardThumbnail(req.file.path, cardThumbPath, 400, 250)

      // Clean up original
      fs.unlinkSync(req.file.path)

      thumbnailUrl = `/books/${bookId}/cover-card.jpg`
    }

    // Save lessons
    const savedLessons: SavedLesson[] = validLessons.map(lesson => {
      const lessonId = randomUUID()
      const fileName = `${lesson.order.toString().padStart(2, '0')}-${lessonId}.txt`
      const filePath = path.join(bookDir, fileName)
      fs.writeFileSync(filePath, lesson.content, 'utf-8')
      return { id: lessonId, title: lesson.title, order: lesson.order, fileName }
    })

    // Save book metadata
    const books = loadBooks()
    const newBook: SavedBook = {
      id: bookId,
      title: title.trim(),
      description: (description || '').trim(),
      thumbnailUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lessons: savedLessons
    }
    books.push(newBook)
    saveBooks(books)

    res.status(201).json(newBook)
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ message: err.message || 'Failed to save book' })
  }
})

// PUT update book
app.put('/api/admin/books/:bookId', upload.single('thumbnail'), async (req, res) => {
  try {
    const bookId = req.params.bookId
    const { title, description } = req.body
    const lessonsRaw = req.body.lessons

    if (!title || !lessonsRaw) {
      return res.status(400).json({ message: 'Missing title or lessons' })
    }

    const books = loadBooks()
    const bookIndex = books.findIndex(b => b.id === bookId)
    if (bookIndex === -1) {
      return res.status(404).json({ message: 'Book not found' })
    }

    const lessonsInput: { title: string; content: string }[] = JSON.parse(lessonsRaw)
    const validLessons = lessonsInput
      .map((l, index) => ({
        title: (l.title || '').trim(),
        content: (l.content || '').trim(),
        order: index + 1
      }))
      .filter(l => l.title && l.content)

    if (validLessons.length === 0) {
      return res.status(400).json({ message: 'At least one valid lesson required' })
    }

    const bookDir = path.join(__dirname, 'books', bookId)

    // Handle thumbnail update
    let thumbnailUrl = books[bookIndex].thumbnailUrl
    if (req.file) {
      const cardThumbPath = path.join(bookDir, 'cover-card.jpg')
      await generateCardThumbnail(req.file.path, cardThumbPath, 400, 250)
      fs.unlinkSync(req.file.path)
      thumbnailUrl = `/books/${bookId}/cover-card.jpg`
    }

    // Update lessons (delete old, create new)
    const oldLessonFiles = fs.readdirSync(bookDir).filter(f => f.endsWith('.txt'))
    oldLessonFiles.forEach(file => fs.unlinkSync(path.join(bookDir, file)))

    const savedLessons: SavedLesson[] = validLessons.map(lesson => {
      const lessonId = randomUUID()
      const fileName = `${lesson.order.toString().padStart(2, '0')}-${lessonId}.txt`
      const filePath = path.join(bookDir, fileName)
      fs.writeFileSync(filePath, lesson.content, 'utf-8')
      return { id: lessonId, title: lesson.title, order: lesson.order, fileName }
    })

    // Update book
    books[bookIndex] = {
      ...books[bookIndex],
      title: title.trim(),
      description: (description || '').trim(),
      thumbnailUrl,
      updatedAt: new Date().toISOString(),
      lessons: savedLessons
    }

    saveBooks(books)
    res.json(books[bookIndex])
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ message: err.message || 'Failed to update book' })
  }
})

// DELETE book
app.delete('/api/admin/books/:bookId', (req, res) => {
  try {
    const bookId = req.params.bookId
    const bookDir = path.join(__dirname, 'books', bookId)

    if (fs.existsSync(bookDir)) {
      fs.rmSync(bookDir, { recursive: true, force: true })
    }

    const books = loadBooks()
    const filtered = books.filter(b => b.id !== bookId)
    saveBooks(filtered)

    res.json({ message: 'Book deleted' })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ message: 'Failed to delete book' })
  }
})


// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`)
  console.log(`📁 Books served from http://localhost:${PORT}/books`)
})
