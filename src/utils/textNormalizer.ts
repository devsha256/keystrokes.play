import { ValidationResult } from '../types'

export const normalizeText = (text: string): string => {
  if (!text) return ''

  return text
    .replace(/[àáâãäå]/gi, 'a')
    .replace(/[èéêë]/gi, 'e')
    .replace(/[ìíîï]/gi, 'i')
    .replace(/[òóôõö]/gi, 'o')
    .replace(/[ùúûü]/gi, 'u')
    .replace(/[ýÿ]/gi, 'y')
    .replace(/[ç]/gi, 'c')
    .replace(/[ñ]/gi, 'n')
    .replace(/æ/gi, 'ae')
    .replace(/œ/gi, 'oe')
    .replace(/ð/gi, 'd')
    .replace(/þ/gi, 'th')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2026]/g, '...')
    .replace(/–/g, '-')
    .replace(/[^\w\s\-'".]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const normalizeForDisplay = (text: string): string => {
  return text
    .replace(/[^\w\s\-'",.?!;:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const isValidTypingText = (text: string): boolean => {
  const normalized = normalizeText(text)

  if (normalized.length < 10) return false
  if (!/[\w]/.test(normalized)) return false
  const trimmed = normalized.trim()
  if (trimmed.length === 0) return false

  return true
}

export const validateTypingText = (text: string): ValidationResult => {
  const normalized = normalizeText(text)
  const issues: string[] = []

  if (normalized.length < 10) {
    issues.push(`Text too short (${normalized.length}/10 characters)`)
  }

  if (!/[\w]/.test(normalized)) {
    issues.push('No valid word characters found')
  }

  const wordCount = normalized.trim().split(/\s+/).filter(Boolean).length
  if (wordCount < 3) {
    issues.push(`Too few words (${wordCount} words)`)
  }

  const isValid =
    normalized.length >= 10 &&
    /[\w]/.test(normalized) &&
    wordCount >= 3

  return {
    isValid,
    message: isValid
      ? `Ready! ${normalized.length} chars, ${wordCount} words`
      : 'Text not suitable for typing test',
    normalizedLength: normalized.length,
    wordCount,
    issues
  }
}
