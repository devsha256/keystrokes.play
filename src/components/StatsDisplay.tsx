import React from 'react'
import { motion } from 'framer-motion'
import { StatsDisplayProps } from '../types'

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats, onReset }) => {
  const getPerformanceMessage = (wpm: number, accuracy: number): string => {
    if (accuracy >= 95 && wpm >= 60) return '🏆 Outstanding!'
    if (accuracy >= 90 && wpm >= 45) return '🎯 Excellent!'
    if (accuracy >= 85 && wpm >= 30) return '✨ Great Job!'
    if (accuracy >= 80) return '👍 Good Work!'
    return '💪 Keep Practicing!'
  }

  return (
    <div className="final-stats">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {getPerformanceMessage(stats.wpm, stats.accuracy)}
      </motion.h2>

      <div className="stats-grid">
        <motion.div
          className="final-stat-card"
          whileHover={{ scale: 1.05, borderColor: '#6366f1' }}
        >
          <span className="final-stat-label">Words Per Minute</span>
          <span className="final-stat-value">{stats.wpm}</span>
        </motion.div>

        <motion.div
          className="final-stat-card"
          whileHover={{ scale: 1.05, borderColor: '#10b981' }}
        >
          <span className="final-stat-label">Accuracy</span>
          <span className="final-stat-value">{stats.accuracy}%</span>
        </motion.div>

        <motion.div
          className="final-stat-card"
          whileHover={{ scale: 1.05, borderColor: '#ef4444' }}
        >
          <span className="final-stat-label">Total Errors</span>
          <span className="final-stat-value">{stats.totalErrors}</span>
        </motion.div>

        <motion.div
          className="final-stat-card"
          whileHover={{ scale: 1.05, borderColor: '#f59e0b' }}
        >
          <span className="final-stat-label">Time</span>
          <span className="final-stat-value">{stats.timeInSeconds}s</span>
        </motion.div>
      </div>

      <motion.button
        className="button"
        onClick={onReset}
        style={{ marginTop: '2rem' }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Try Again
      </motion.button>
    </div>
  )
}

export default StatsDisplay
