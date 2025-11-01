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
