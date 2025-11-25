import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Alert,
  Button
} from '@mui/material';
import { texts } from '../constants/texts';
import { getAssignmentByToken, markAsAccessed, isTokenAccessed } from '../utils/storage';
import type { Assignment } from '../types';

const ResultView = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [error, setError] = useState('');
  const [alreadyAccessed, setAlreadyAccessed] = useState(false);

  useEffect(() => {
    const loadAssignment = () => {
      if (!token) {
        setError('Token inválido');
        return;
      }

      // Verificar si el token ya fue accedido
      if (isTokenAccessed(token)) {
        setAlreadyAccessed(true);
        return;
      }

      // Obtener la asignación
      const result = getAssignmentByToken(token);

      if (!result) {
        setError('No se encontró información para este enlace');
        return;
      }

      // Marcar como accedido y guardar el estado local
      markAsAccessed(token);
      setAssignment(result);
    };

    loadAssignment();
  }, [token]);

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Volver al inicio
        </Button>
      </Container>
    );
  }

  if (alreadyAccessed) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="info">
          Este enlace ya ha sido accedido. No se puede volver a abrir.<br />
          Si necesitas ver tu asignación, contacta al administrador.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Volver al inicio
        </Button>
      </Container>
    );
  }

  if (!assignment) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Typography>Cargando...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: 2, minWidth: 500, maxWidth: 700, mx: 'auto', mt: 6, p: 3 }}>
        <CardContent>
          <Typography variant="h4" align="center" color="primary" gutterBottom fontWeight="bold">
            {texts.result.title}
          </Typography>
          {alreadyAccessed ? (
            <Alert severity="info" sx={{ mt: 3, mb: 2 }}>
              {texts.result.alreadyOpened}
            </Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, mt: 4 }}>
              <Typography variant="h5" color="secondary" fontWeight="bold">
                {texts.result.hello}<span style={{ color: '#1976d2' }}>{assignment.giver}</span>!
              </Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                {texts.result.assigned}
              </Typography>
              <Box sx={{ bgcolor: 'grey.100', borderRadius: 2, px: 4, py: 2, boxShadow: 1, minWidth: 300 }}>
                <Typography variant="h4" color="primary.dark" fontWeight="bold" align="center">
                  {assignment.receiver}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                {texts.result.secret}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ResultView;
