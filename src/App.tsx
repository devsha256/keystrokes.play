import React from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { ThemeProvider, CssBaseline, Box, AppBar, Toolbar, Typography, Tabs, Tab, Container } from '@mui/material'
import KeyboardAltIcon from '@mui/icons-material/KeyboardAlt'
import EditNoteIcon from '@mui/icons-material/EditNote'
import SettingsIcon from '@mui/icons-material/Settings'
import PracticeTab from './components/PracticeTab'
import CustomTypingTab from './components/CustomTypingTab'
import SessionPage from './components/SessionPage'
import AdminTab from './components/AdminTab'
import theme from './theme'

const App: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // Determine active tab index based on path
  const currentPath = location.pathname
  let tabValue = 0
  if (currentPath === '/') tabValue = 0
  else if (currentPath === '/custom') tabValue = 1
  else if (currentPath.startsWith('/admin')) tabValue = 2
  else tabValue = -1 // Hide tabs if on session page or unknown

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0) navigate('/')
    else if (newValue === 1) navigate('/custom')
    else if (newValue === 2) navigate('/admin')
  }

  // Hide Navbar on session page for immersiveness
  const isSession = currentPath === '/session'

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
        {!isSession && (
          <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Toolbar>
              <Typography variant="h5" component="div" sx={{ flexGrow: 0, mr: 4, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', backgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>
                Typing Portal
              </Typography>
              <Tabs value={tabValue !== -1 ? tabValue : false} onChange={handleTabChange} aria-label="nav tabs">
                <Tab icon={<KeyboardAltIcon />} label="Practice" iconPosition="start" />
                <Tab icon={<EditNoteIcon />} label="Custom" iconPosition="start" />
                <Tab icon={<SettingsIcon />} label="Admin" iconPosition="start" />
              </Tabs>
            </Toolbar>
          </AppBar>
        )}

        {isSession ? (
          <Routes>
            <Route path="/session" element={<SessionPage />} />
          </Routes>
        ) : (
          <Container component="main" maxWidth="xl" sx={{ flexGrow: 1, py: 4, display: 'flex', flexDirection: 'column' }}>
            <Routes>
              <Route path="/" element={<PracticeTab />} />
              <Route path="/custom" element={<CustomTypingTab />} />
              <Route path="/admin" element={<AdminTab />} />
              <Route path="/session" element={<SessionPage />} />
            </Routes>
          </Container>
        )}
      </Box>
    </ThemeProvider>
  )
}


export default App
