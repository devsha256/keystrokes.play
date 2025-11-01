import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TextUploader from './components/TextUploader'
import TypingArea from './components/TypingArea'
import StatsDisplay from './components/StatsDisplay'
import { TypingStats } from './types'

const App: React.FC = () => {
  const [textToType, setTextToType] = useState<string>('')
  const [isTypingStarted, setIsTypingStarted] = useState<boolean>(false)
  const [isCompleted, setIsCompleted] = useState<boolean>(false)
  const [finalStats, setFinalStats] = useState<TypingStats | null>(null)

  const handleTextSubmit = (text: string): void => {
    setTextToType(text)
    setIsTypingStarted(false)
    setIsCompleted(false)
    setFinalStats(null)
  }

  const handleStart = (): void => {
    if (textToType.trim()) {
      setIsTypingStarted(true)
      setIsCompleted(false)
    }
  }

  const handleComplete = (stats: TypingStats): void => {
    setIsCompleted(true)
    setFinalStats(stats)
  }

  const handleReset = (): void => {
    setTextToType('')
    setIsTypingStarted(false)
    setIsCompleted(false)
    setFinalStats(null)
  }

  return (
    <div className="app-container">
      <motion.div 
        className="header"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>Typing Portal</h1>
        <p>Test your typing speed and accuracy</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!isTypingStarted && !isCompleted && (
          <motion.div
            key="uploader"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
          >
            <div className="card">
              <TextUploader onTextSubmit={handleTextSubmit} />
              {textToType && (
                <motion.button
                  className="button"
                  onClick={handleStart}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start Typing Test
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {isTypingStarted && !isCompleted && (
          <motion.div
            key="typing"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <div className="card">
              <TypingArea
                referenceText={textToType}
                onComplete={handleComplete}
                onReset={handleReset}
              />
            </div>
          </motion.div>
        )}

        {isCompleted && finalStats && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, type: 'spring' }}
          >
            <div className="card">
              <StatsDisplay stats={finalStats} onReset={handleReset} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
