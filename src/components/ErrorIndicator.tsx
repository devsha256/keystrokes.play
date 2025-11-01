import React from 'react'
import { motion } from 'framer-motion'
import { ErrorIndicatorProps } from '../types'

const ErrorIndicator: React.FC<ErrorIndicatorProps> = ({ consecutiveErrors, isBlocked }) => {
  return (
    <motion.div
      className="error-indicator"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      {isBlocked ? (
        <>
          🚫 Blocked! Wait 2 seconds...
        </>
      ) : (
        <>
          ⚠️ Consecutive Errors:
          <motion.span
            className="error-count"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.3 }}
          >
            {consecutiveErrors}/3
          </motion.span>
        </>
      )}
    </motion.div>
  )
}

export default ErrorIndicator
