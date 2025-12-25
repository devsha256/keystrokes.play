import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Box, Typography, Button } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import TextUploader from './TextUploader'
import { normalizeText } from '../utils/textNormalizer'

const CustomTypingTab: React.FC = () => {
    const navigate = useNavigate()
    const [textToType, setTextToType] = useState<string>('')

    const handleTextSubmit = (raw: string) => {
        const normalized = normalizeText(raw)
        setTextToType(normalized)
    }

    const handleStart = () => {
        if (textToType.trim()) {
            navigate('/session', {
                state: {
                    text: textToType,
                    from: '/custom'
                }
            })
        }
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight="600" color="text.primary">
                Custom Typing
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Paste any text below to practice typing it.
            </Typography>

            <AnimatePresence mode="wait">
                <motion.div
                    key="custom-uploader"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.25 }}
                >
                    <TextUploader onTextSubmit={handleTextSubmit} />
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Button
                            variant="contained"
                            size="large"
                            endIcon={<PlayArrowIcon />}
                            onClick={handleStart}
                            disabled={!textToType.trim()}
                            sx={{ px: 5, py: 1.5, fontSize: '1.1rem' }}
                        >
                            Start Typing
                        </Button>
                    </Box>
                </motion.div>
            </AnimatePresence>
        </Box>
    )
}

export default CustomTypingTab
