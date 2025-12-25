import React, { useState, useCallback, useMemo } from 'react'
import { useDropzone, FileRejection, DropEvent } from 'react-dropzone'
import { motion } from 'framer-motion'
import { TextUploaderProps } from '../types'
import { normalizeText, validateTypingText } from '../utils/textNormalizer'

const TextUploader: React.FC<TextUploaderProps> = ({ onTextSubmit }) => {
  const [rawText, setRawText] = useState<string>('')

  const validation = useMemo(() => validateTypingText(rawText), [rawText])
  const normalizedText = useMemo(() => normalizeText(rawText), [rawText])

  const onDrop = useCallback(
    (acceptedFiles: File[], _fileRejections: FileRejection[], _event: DropEvent) => {
      const file = acceptedFiles[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const content = e.target?.result as string
          setRawText(content)
          if (content.trim()) {
            onTextSubmit(normalizeText(content))
          }
        }
        reader.readAsText(file)
      }
    },
    [onTextSubmit]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.txt'] },
    maxFiles: 1,
    multiple: false
  })

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const newText = e.target.value
    setRawText(newText)
    const timer = setTimeout(() => {
      if (newText.trim()) {
        onTextSubmit(normalizeText(newText))
      } else {
        onTextSubmit('')
      }
    }, 300)
    return () => clearTimeout(timer)
  }

  return (
    <div className="uploader-section">
      <div className="textarea-container">
        <textarea
          className="text-input"
          value={rawText}
          onChange={handleTextChange}
          placeholder="Paste your text here... Special characters will be automatically normalized"
          spellCheck={false}
          rows={6}
        />

        {normalizedText && (
          <div
            style={{
              fontSize: '0.85rem',
              marginTop: '0.5rem',
              padding: '0.75rem',
              background: validation.isValid
                ? 'rgba(16,185,129,0.1)'
                : 'rgba(239,68,68,0.1)',
              borderRadius: '0.5rem',
              borderLeft: `4px solid ${
                validation.isValid ? '#10b981' : '#ef4444'
              }`,
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            📝 {validation.message}
            {normalizedText !== rawText.trim() && (
              <>
                {' → '}
                <span style={{ color: '#6366f1' }}>
                  {normalizedText.slice(0, 40)}
                  {normalizedText.length > 40 ? '...' : ''}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <motion.div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input {...getInputProps()} />
        <div className="dropzone-icon">📁</div>
        {isDragActive ? (
          <p>Drop your text file here...</p>
        ) : (
          <p>Or drag & drop a .txt file (will be automatically normalized)</p>
        )}
      </motion.div>
    </div>
  )
}

export default TextUploader
