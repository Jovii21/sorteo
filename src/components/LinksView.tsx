import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  Tooltip
} from '@mui/material';
import { ContentCopy, Link as LinkIcon } from '@mui/icons-material';
import { getDrawResult, getDrawList, clearDraw } from '../utils/storage';
import type { Assignment } from '../types';

const LinksView = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [draws, setDraws] = useState(getDrawList());

  useEffect(() => {
    const interval = setInterval(() => {
      setDraws(getDrawList());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleLoadLinks = () => {
    const drawResult = getDrawResult();
    if (drawResult) {
      setAssignments(drawResult.assignments);
      setLoaded(true);
    }
    setDraws(getDrawList());
  };

  const generateLink = (token: string): string => {
    return `${window.location.origin}/result/${token}`;
  };

  const handleCopyLink = async (token: string) => {
    const link = generateLink(token);
    try {
      await navigator.clipboard.writeText(link);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const handleClearDraw = () => {
    clearDraw();
    setAssignments([]);
    setLoaded(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
        Enlaces para Participantes
      </Typography>

      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography variant="h6" className="text-primary" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
          Sorteos guardados
        </Typography>
        <List>
          {draws.map(draw => (
            <ListItem key={draw.id}>
              <ListItemText
                primary={draw.name ? draw.name : 'Sorteo'}
                secondary={draw.createdAt ? new Date(draw.createdAt).toLocaleString() : ''}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {!loaded ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<LinkIcon />}
            onClick={handleLoadLinks}
          >
            Cargar Enlaces
          </Button>
        </Box>
      ) : assignments.length === 0 ? (
        <Alert severity="info" sx={{ mt: 4 }}>
          No hay ningún sorteo activo. Ve a la página principal para crear uno.
        </Alert>
      ) : (
        <>
          <Alert severity="info" sx={{ mt: 3, mb: 3 }}>
            Comparte estos enlaces con cada participante. Cada enlace solo puede abrirse una vez.
          </Alert>

          <Card>
            <CardContent>
              <List>
                {assignments.map((assignment) => (
                  <ListItem
                    key={assignment.token}
                    sx={{
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 'none' }
                    }}
                    secondaryAction={
                      <Tooltip
                        title={copiedToken === assignment.token ? '¡Copiado!' : 'Copiar enlace'}
                      >
                        <IconButton
                          edge="end"
                          onClick={() => handleCopyLink(assignment.token)}
                          color={copiedToken === assignment.token ? 'success' : 'default'}
                        >
                          <ContentCopy />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography variant="h6" component="span">
                          {assignment.giver}
                        </Typography>
                      }
                      secondary={
                        <Box component="span" sx={{ display: 'block', mt: 1 }}>
                          <Typography
                            variant="body2"
                            component="span"
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                              bgcolor: 'background.default',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              display: 'inline-block',
                              wordBreak: 'break-all'
                            }}
                          >
                            {generateLink(assignment.token)}
                          </Typography>
                          {assignment.accessed && (
                            <Typography
                              variant="caption"
                              color="error"
                              component="span"
                              sx={{ ml: 2 }}
                            >
                              ✓ Ya abierto
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClearDraw}
              sx={{ mb: 2 }}
            >
              Limpiar Sorteo
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default LinksView;
