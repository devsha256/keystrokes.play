import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Box, Paper, Typography, Button, Stack, Container, IconButton } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import TypingArea from './TypingArea'
import StatsDisplay from './StatsDisplay'
import { TypingStats, Book, Lesson } from '../types'
import { normalizeText } from '../utils/textNormalizer'

interface SessionState {
    text?: string
    book?: Book
    lesson?: Lesson
    nextLesson?: Lesson
    from?: string
}

const SessionPage: React.FC = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const state = location.state as SessionState | null

    const [mode, setMode] = useState<'typing' | 'completed'>('typing')
    const [finalStats, setFinalStats] = useState<TypingStats | null>(null)

    // Normalized text to type
    const [targetText, setTargetText] = useState('')
    const [liveStats, setLiveStats] = useState({ wpm: 0, accuracy: 100, totalErrors: 0, progress: 0 })

    useEffect(() => {
        if (!state?.text && (!state?.book || !state?.lesson)) {
            // Invalid state, redirect back
            navigate('/')
            return
        }

        if (state.text) {
            setTargetText(state.text)
        } else if (state.book && state.lesson) {
            // We might need to fetch the content if it wasn't passed fully, 
            // but let's assume for now we might need to fetch it or it was passed.
            // Actually PracticeTab was fetching it. Let's start by fetching if needed 
            // OR expecting PracticeTab to pass the text.
            // PracticeTab fetches `text` then sets state. We should pass that text.
            navigate('/') // Fallback for now if text missing, logic to be added if fetching here.
        }
    }, [state, navigate])

    // We need to handle the case where PracticeTab passes the fetched text.
    useEffect(() => {
        if (state?.text) {
            setTargetText(state.text)
            setMode('typing')
            setFinalStats(null)
        }
    }, [state])

    const handleComplete = (stats: TypingStats) => {
        setFinalStats(stats)
        setMode('completed')
    }

    const handleReset = () => {
        setMode('typing')
        setFinalStats(null)
    }

    const handleExit = () => {
        navigate(state?.from || '/')
    }

    const handleNextLesson = async () => {
        if (!state?.book || !state?.nextLesson) return

        // Fetch next lesson text
        try {
            const res = await fetch(`/books/${state.book.id}/${state.nextLesson.fileName}`)
            if (!res.ok) throw new Error('Failed to load lesson text')
            const text = await res.text()
            const normalized = normalizeText(text)

            // Navigate to self with new state
            const nextNextLesson = getNextLesson(state.book, state.nextLesson)

            navigate('/session', {
                state: {
                    text: normalized,
                    book: state.book,
                    lesson: state.nextLesson,
                    nextLesson: nextNextLesson,
                    from: state.from
                },
                replace: true
            })
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4, height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={handleExit} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" color="text.secondary">
                    {state?.lesson ? `${state.book?.title} – ${state.lesson.title}` : 'Custom Practice'}
                </Typography>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    flexGrow: 1,
                    p: 4,
                    bgcolor: 'background.paper',
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative'
                }}
            >
                {mode === 'typing' && targetText && (
                    <Box sx={{ width: '100%', height: '100%' }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 4, height: '100%' }}>
                            {/* Left Side: Typing Area */}
                            <Box sx={{
                                bgcolor: 'background.default',
                                p: 3,
                                borderRadius: 2
                            }}>
                                <TypingArea
                                    referenceText={targetText}
                                    onComplete={handleComplete}
                                    onReset={handleReset}
                                    onStatsUpdate={setLiveStats}
                                    simpleMode
                                />
                            </Box>

                            {/* Right Side: Live Stats */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2, textAlign: 'center' }}>
                                    <Typography variant="overline" color="text.secondary">WPM</Typography>
                                    <Typography variant="h2" color="primary" fontWeight="bold">
                                        {liveStats.wpm}
                                    </Typography>
                                </Paper>

                                <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2, textAlign: 'center' }}>
                                    <Typography variant="overline" color="text.secondary">Accuracy</Typography>
                                    <Typography variant="h2" color={liveStats.accuracy >= 95 ? 'success.main' : 'warning.main'} fontWeight="bold">
                                        {liveStats.accuracy}%
                                    </Typography>
                                </Paper>

                                <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2, textAlign: 'center' }}>
                                    <Typography variant="overline" color="text.secondary">Progress</Typography>
                                    <Typography variant="h4" color="text.primary">
                                        {liveStats.progress}%
                                    </Typography>
                                </Paper>

                                <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2, textAlign: 'center' }}>
                                    <Typography variant="overline" color="text.secondary">Errors</Typography>
                                    <Typography variant="h4" color="error.main">
                                        {liveStats.totalErrors}
                                    </Typography>
                                </Paper>
                            </Box>
                        </Box>
                    </Box>
                )}

                {mode === 'completed' && finalStats && (
                    <Box sx={{ width: '100%', maxWidth: '800px', textAlign: 'center' }}>
                        <StatsDisplay stats={finalStats} onReset={handleReset} />

                        <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 6 }}>
                            <Button
                                variant="outlined"
                                size="large"
                                startIcon={<RestartAltIcon />}
                                onClick={handleReset}
                            >
                                Retry
                            </Button>

                            {state?.nextLesson && (
                                <Button
                                    variant="contained"
                                    size="large"
                                    endIcon={<SkipNextIcon />}
                                    onClick={handleNextLesson}
                                >
                                    Next Lesson
                                </Button>
                            )}

                            <Button
                                color="error"
                                size="large"
                                startIcon={<ExitToAppIcon />}
                                onClick={handleExit}
                            >
                                Exit
                            </Button>
                        </Stack>
                    </Box>
                )}
            </Paper>
        </Container>
    )
}

// Helper to determine next lesson
function getNextLesson(book: Book, currentLesson: Lesson): Lesson | undefined {
    const sorted = [...book.lessons].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex(l => l.id === currentLesson.id)
    return sorted[idx + 1]
}

export default SessionPage
