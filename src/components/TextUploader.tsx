import React, { useState, useCallback } from 'react'
import { useDropzone, FileRejection, DropEvent } from 'react-dropzone'
import { motion } from 'framer-motion'
import { TextUploaderProps } from '../types'

const TextUploader: React.FC<TextUploaderProps> = ({ onTextSubmit }) => {
  const [text, setText] = useState<string>('')

  const onDrop = useCallback((
    acceptedFiles: File[], 
    _fileRejections: FileRejection[], 
    _event: DropEvent
  ) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const content = e.target?.result as string
        setText(content)
        onTextSubmit(content)
      }
      reader.readAsText(file)
    }
  }, [onTextSubmit])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.txt'] },
    maxFiles: 1,
    multiple: false
  })

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const newText = e.target.value
    setText(newText)
    onTextSubmit(newText)
  }

  return (
    <div className="uploader-section">
      <div className="textarea-container">
        <textarea
          className="text-input"
          value={text}
          onChange={handleTextChange}
          placeholder="Paste your text here or drag and drop a text file below..."
          spellCheck={false}
        />
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
          <p>Drag and drop a text file here, or click to select</p>
        )}
      </motion.div>
    </div>
  )
}

export default TextUploader
