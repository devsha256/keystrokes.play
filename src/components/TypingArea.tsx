import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ErrorIndicator from './ErrorIndicator'
import { calculateWPM, calculateAccuracy } from '../utils/typingMetrics'
import { TypingAreaProps } from '../types'

const TypingArea: React.FC<TypingAreaProps> = ({ referenceText, onComplete, onReset, onStatsUpdate, simpleMode }) => {
  const [typedText, setTypedText] = useState<string>('')
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [consecutiveErrors, setConsecutiveErrors] = useState<number>(0)
  const [totalErrors, setTotalErrors] = useState<number>(0)
  const [isBlocked, setIsBlocked] = useState<boolean>(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [wpm, setWpm] = useState<number>(0)
  const [accuracy, setAccuracy] = useState<number>(100)
  const [mistakeIndices, setMistakeIndices] = useState<Set<number>>(new Set())

  const inputRef = useRef<HTMLInputElement>(null)
  const activeCharRef = useRef<HTMLSpanElement>(null)
  const textContainerRef = useRef<HTMLDivElement>(null)
  const lastCharTopRef = useRef<number | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (activeCharRef.current && textContainerRef.current) {
      const char = activeCharRef.current
      const container = textContainerRef.current
      const charTop = char.offsetTop

      // Only scroll if the character's vertical position has changed (new line)
      if (lastCharTopRef.current !== charTop) {
        const targetScrollTop = charTop - 10
        container.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        })
        lastCharTopRef.current = charTop
      }
    }
  }, [currentIndex])

  useEffect(() => {
    if (currentIndex === referenceText.length && currentIndex > 0 && startTime) {
      const endTime = Date.now()
      const timeInMinutes = (endTime - startTime) / 60000
      const finalWpm = calculateWPM(referenceText.length, timeInMinutes)
      const finalAccuracy = calculateAccuracy(referenceText.length, totalErrors)

      setTimeout(() => {
        onComplete({
          wpm: finalWpm,
          accuracy: finalAccuracy,
          totalErrors,
          timeInSeconds: Math.round((endTime - startTime) / 1000),
          charactersTyped: referenceText.length
        })
      }, 500)
    }
  }, [currentIndex, referenceText, startTime, totalErrors, onComplete])

  useEffect(() => {
    if (onStatsUpdate) {
      onStatsUpdate({
        wpm,
        accuracy,
        totalErrors,
        progress: Math.round((currentIndex / referenceText.length) * 100)
      })
    }
  }, [wpm, accuracy, totalErrors, currentIndex, referenceText.length, onStatsUpdate])

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (isBlocked) {
      e.preventDefault()
      return
    }

    if (!startTime) {
      setStartTime(Date.now())
    }

    const char = e.key

    if (char === 'Backspace') {
      if (currentIndex > 0) {
        setTypedText(prev => prev.slice(0, -1))
        setCurrentIndex(prev => prev - 1)
        setConsecutiveErrors(0)
      }
      return
    }

    if (char === referenceText[currentIndex]) {
      // Correct character
      setTypedText(prev => prev + char)
      setCurrentIndex(prev => prev + 1)
      setConsecutiveErrors(0)

      // Update real-time stats
      const timeElapsed = (Date.now() - (startTime || Date.now())) / 60000
      const currentWpm = calculateWPM(currentIndex + 1, timeElapsed || 0.01)
      setWpm(Math.round(currentWpm))
      setAccuracy(calculateAccuracy(currentIndex + 1, totalErrors))
    } else if (char.length === 1 && !e.ctrlKey && !e.metaKey) {
      // Incorrect character
      setTypedText(prev => prev + char)
      setCurrentIndex(prev => prev + 1)

      const newConsecutiveErrors = consecutiveErrors + 1
      setConsecutiveErrors(newConsecutiveErrors)
      setTotalErrors(prev => prev + 1)

      // Track that this index had a mistake
      setMistakeIndices(prev => new Set(prev).add(currentIndex))

      // Update accuracy
      setAccuracy(calculateAccuracy(currentIndex + 1, totalErrors + 1))
    }
  }

  const renderCharacters = (): JSX.Element[] => {
    return referenceText.split('').map((char: string, index: number) => {
      let className = 'char'
      let isCurrent = false
      if (index < currentIndex) {
        if (typedText[index] === char) {
          className += mistakeIndices.has(index) ? ' corrected' : ' correct'
        } else {
          className += ' incorrect'
        }
      } else if (index === currentIndex) {
        className += ' current'
        isCurrent = true
      }

      return (
        <span
          key={index}
          ref={isCurrent ? activeCharRef : null}
          className={className}
        >
          {char}
        </span>
      )
    })
  }

  return (
    <div className="typing-area">
      <input
        ref={inputRef}
        type="text"
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none'
        }}
        onKeyDown={handleKeyPress}
        autoFocus
      />

      <div
        className="reference-text"
        ref={textContainerRef}
        onClick={() => inputRef.current?.focus()}
        role="textbox"
        tabIndex={0}
      >
        {renderCharacters()}
      </div>

      {!simpleMode && (
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-label">WPM</span>
            <motion.span
              className="stat-value"
              key={wpm}
              initial={{ scale: 1.2, color: '#6366f1' }}
              animate={{ scale: 1, color: '#6366f1' }}
            >
              {wpm}
            </motion.span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Accuracy</span>
            <motion.span
              className="stat-value"
              key={accuracy}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
            >
              {accuracy}%
            </motion.span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Errors</span>
            <motion.span
              className="stat-value"
              key={totalErrors}
              initial={{ scale: 1.3, color: '#ef4444' }}
              animate={{ scale: 1, color: '#6366f1' }}
            >
              {totalErrors}
            </motion.span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Progress</span>
            <span className="stat-value">
              {Math.round((currentIndex / referenceText.length) * 100)}%
            </span>
          </div>
        </div>
      )}

      <AnimatePresence>
        {consecutiveErrors > 0 && (
          <ErrorIndicator
            consecutiveErrors={consecutiveErrors}
            isBlocked={isBlocked}
          />
        )}
      </AnimatePresence>

      {isBlocked && <div className="blocked-overlay" />}

      <motion.button
        className="button"
        onClick={onReset}
        style={{ marginTop: '1.5rem', background: '#ef4444' }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Reset
      </motion.button>
    </div>
  )
}

export default TypingArea
