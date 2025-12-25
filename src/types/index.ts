export interface TypingStats {
  wpm: number
  accuracy: number
  totalErrors: number
  timeInSeconds: number
  charactersTyped: number
}

export interface CharacterState {
  char: string
  index: number
  status: 'pending' | 'correct' | 'incorrect' | 'current'
}

export interface TypingMetrics {
  startTime: number | null
  endTime: number | null
  totalCharacters: number
  correctCharacters: number
  incorrectCharacters: number
  currentIndex: number
}

export interface TextUploaderProps {
  onTextSubmit: (text: string) => void
}

export interface TypingAreaProps {
  referenceText: string
  onComplete: (stats: TypingStats) => void
  onReset: () => void
  onStatsUpdate?: (stats: { wpm: number; accuracy: number; totalErrors: number; progress: number }) => void
  simpleMode?: boolean
}

export interface StatsDisplayProps {
  stats: TypingStats
  onReset: () => void
}

export interface ErrorIndicatorProps {
  consecutiveErrors: number
  isBlocked: boolean
}

export type PerformanceGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'

export interface ValidationResult {
  isValid: boolean
  message: string
  normalizedLength: number
  wordCount: number
  issues: string[]
}

export interface Lesson {
  id: string
  title: string
  order: number
  fileName?: string
}

export interface Book {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  createdAt: string
  updatedAt: string
  lessons: Lesson[]
}
