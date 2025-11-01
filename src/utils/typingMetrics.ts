import { PerformanceGrade } from '../types'

export const calculateWPM = (characters: number, minutes: number): number => {
  if (minutes === 0) return 0
  const words = characters / 5 // Standard: 5 characters = 1 word
  return Math.round(words / minutes)
}

export const calculateAccuracy = (totalCharacters: number, errors: number): number => {
  if (totalCharacters === 0) return 100
  const accuracy = ((totalCharacters - errors) / totalCharacters) * 100
  return Math.max(0, Math.round(accuracy))
}

export const calculateNetWPM = (grossWPM: number, accuracy: number): number => {
  return Math.round(grossWPM * (accuracy / 100))
}

export const getGrade = (wpm: number, accuracy: number): PerformanceGrade => {
  if (accuracy < 80) return 'F'
  if (wpm >= 70 && accuracy >= 95) return 'A+'
  if (wpm >= 60 && accuracy >= 90) return 'A'
  if (wpm >= 50 && accuracy >= 85) return 'B'
  if (wpm >= 40 && accuracy >= 80) return 'C'
  return 'D'
}

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}
