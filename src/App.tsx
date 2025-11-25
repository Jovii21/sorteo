import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, Typography, Box, Container, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';
import ResultView from './components/ResultView';
import LinksView from './components/LinksView';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0a2342', // azul oscuro
      contrastText: '#fff',
    },
    secondary: {
      main: '#185adb', // azul vibrante
      contrastText: '#fff',
    },
    background: {
      default: '#101a2b',
      paper: '#162447',
    },
    text: {
      primary: '#fff',
      secondary: '#bfc9d1',
    },
  },
  typography: {
    fontFamily: 'Montserrat, Roboto, Helvetica, Arial, sans-serif',
    h3: {
      fontWeight: 800,
      fontSize: '2.8rem',
      color: '#fff',
      letterSpacing: '0.04em',
    },
    h6: {
      fontWeight: 700,
      color: '#fff',
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
      fontSize: '1.1rem',
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 32px',
          fontWeight: 700,
          fontSize: '1.1rem',
          backgroundColor: '#185adb',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#0a2342',
            color: '#fff',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#162447',
          color: '#fff',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ bgcolor: '#fff', minHeight: '100vh' }}>
          <AppBar position="static" elevation={0} sx={{ bgcolor: '#0d1a3a', color: '#fff', borderRadius: 0, boxShadow: 2 }}>
            <Toolbar sx={{ minHeight: { xs: 56, sm: 80 }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, px: { xs: 2, sm: 4 }, py: { xs: 1, sm: 0 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', justifyContent: { xs: 'center', sm: 'flex-start' }, mb: { xs: 1, sm: 0 } }}>
                <img src="/logo.png" alt="Jovi Logo" style={{ height: 36, marginRight: 10 }} />
                <Typography variant="h5" fontWeight="bold" sx={{ letterSpacing: 1, fontSize: { xs: '1.4rem', sm: '2rem' } }}>
                  Sorteo de Regalos
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: { xs: 'center', sm: 'flex-end' } }}>
                <Button
                  component={RouterLink}
                  to="/"
                  variant="contained"
                  size="medium"
                  sx={{ bgcolor: '#0d1a3a', color: '#fff', fontWeight: 'bold', boxShadow: 1, borderRadius: 2, px: { xs: 1, sm: 2 }, py: 0.5, minWidth: 80, fontSize: { xs: '0.9rem', sm: '1rem' }, '&:hover': { bgcolor: '#1976d2' } }}
                >
                  Admin
                </Button>
                <Button
                  component={RouterLink}
                  to="/links"
                  variant="contained"
                  size="medium"
                  sx={{ bgcolor: '#0d1a3a', color: '#fff', fontWeight: 'bold', boxShadow: 1, borderRadius: 2, px: { xs: 1, sm: 2 }, py: 0.5, minWidth: 80, fontSize: { xs: '0.9rem', sm: '1rem' }, '&:hover': { bgcolor: '#1976d2' } }}
                >
                  Enlaces
                </Button>
              </Box>
            </Toolbar>
          </AppBar>
          <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 0 } }}>
            <Routes>
              <Route path="/" element={<AdminPanel />} />
              <Route path="/links" element={<LinksView />} />
              <Route path="/result/:token" element={<ResultView />} />
            </Routes>
          </Container>
          <Box component="footer" sx={{ bgcolor: '#0d1a3a', color: '#fff', py: { xs: 1, sm: 2 }, textAlign: 'center', mt: 6, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            <Typography variant="body2">© {new Date().getFullYear()} Jovi</Typography>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
