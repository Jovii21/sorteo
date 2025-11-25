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
import { CardGiftcard } from '@mui/icons-material';
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

      // Marcar como accedido
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
          Este enlace ya ha sido accedido. No se puede volver a abrir.
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
      <Card
        sx={{
          textAlign: 'center',
          py: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <CardContent>
          <CardGiftcard sx={{ fontSize: 80, mb: 2 }} />
          
          <Typography variant="h4" gutterBottom fontWeight="bold">
            ¡Hola, {assignment.giver}!
          </Typography>
          
          <Typography variant="h6" sx={{ my: 3 }}>
            En este intercambio de regalos, le darás tu regalo a:
          </Typography>
          
          <Box
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              p: 3,
              my: 3
            }}
          >
            <Typography variant="h3" fontWeight="bold">
              {assignment.receiver}
            </Typography>
          </Box>
          
          <Typography variant="body1" sx={{ mt: 3, opacity: 0.9 }}>
            🎄 ¡Prepara un regalo especial! 🎄
          </Typography>
          
          <Alert severity="warning" sx={{ mt: 4, textAlign: 'left' }}>
            <Typography variant="body2">
              ⚠️ Importante: Este enlace solo se puede abrir una vez por seguridad.
              Asegúrate de recordar el nombre de tu intercambio.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ResultView;
