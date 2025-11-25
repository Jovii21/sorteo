import { BrowserRouter as Router, Routes, Route, Link as RouterLink } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import AdminPanel from './components/AdminPanel';
import ResultView from './components/ResultView';
import LinksView from './components/LinksView';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static" elevation={0}>
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                🎁 Intercambio de Regalos
              </Typography>
              <Button color="inherit" component={RouterLink} to="/">
                Sorteo
              </Button>
              <Button color="inherit" component={RouterLink} to="/links">
                Ver Enlaces
              </Button>
            </Toolbar>
          </AppBar>

          <Routes>
            <Route path="/" element={<AdminPanel />} />
            <Route path="/links" element={<LinksView />} />
            <Route path="/result/:token" element={<ResultView />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
