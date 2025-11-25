import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { Add, Delete, Casino } from '@mui/icons-material';
import type { Participant, Restriction } from '../types';
import { performDraw } from '../utils/drawEngine';
import { saveDrawResult } from '../utils/storage';

const AdminPanel = () => {
  // Participantes por defecto
  const defaultNames = [
    'Segundo', 'Dorys', 'Carlos', 'Susanita', 'Juni', 'Ita', 'Jeank', 'Keyla', 'Charlie', 'Grace', 'Freddy', 'Ivo', 'George'
  ];
  const defaultParticipants: Participant[] = defaultNames.map((name, idx) => ({
    id: `p-${idx}`,
    name
  }));

  // Restricciones por defecto
  const defaultRestrictions: Restriction[] = [
    { participantId: 'p-0', cannotGiveTo: ['p-1'] }, // Segundo no a Dorys
    { participantId: 'p-1', cannotGiveTo: ['p-0'] }, // Dorys no a Segundo
    { participantId: 'p-9', cannotGiveTo: ['p-10'] }, // Grace no a Freddy
    { participantId: 'p-10', cannotGiveTo: ['p-9'] }, // Freddy no a Grace
    { participantId: 'p-11', cannotGiveTo: ['p-12'] }, // Ivo no a George
    { participantId: 'p-12', cannotGiveTo: ['p-11'] }, // George no a Ivo
    { participantId: 'p-2', cannotGiveTo: ['p-3'] }, // Carlos no a Susanita
    { participantId: 'p-3', cannotGiveTo: ['p-2'] }, // Susanita no a Carlos
    // Juni, Ita, Jeank, Keyla, Charlie no pueden entre ellos
    { participantId: 'p-4', cannotGiveTo: ['p-5','p-6','p-7','p-8'] }, // Juni
    { participantId: 'p-5', cannotGiveTo: ['p-4','p-6','p-7','p-8'] }, // Ita
    { participantId: 'p-6', cannotGiveTo: ['p-4','p-5','p-7','p-8'] }, // Jeank
    { participantId: 'p-7', cannotGiveTo: ['p-4','p-5','p-6','p-8'] }, // Keyla
    { participantId: 'p-8', cannotGiveTo: ['p-4','p-5','p-6','p-7'] }, // Charlie
  ];

  const [participants, setParticipants] = useState<Participant[]>(defaultParticipants);
  const [currentName, setCurrentName] = useState('');
  const [restrictions, setRestrictions] = useState<Restriction[]>(defaultRestrictions);
  const [selectedParticipant, setSelectedParticipant] = useState('');
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [drawCompleted, setDrawCompleted] = useState(false);

  const handleAddParticipant = () => {
    if (!currentName.trim()) {
      setError('Por favor ingresa un nombre');
      return;
    }

    if (participants.length >= 13) {
      setError('Ya tienes 13 participantes');
      return;
    }

    const newParticipant: Participant = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: currentName.trim()
    };

    setParticipants([...participants, newParticipant]);
    setCurrentName('');
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
    setRestrictions(restrictions.filter(r => r.participantId !== id));
  };

  const handleAddRestriction = () => {
    if (!selectedParticipant || selectedRestrictions.length === 0) {
      setError('Selecciona un participante y al menos una restricción');
      return;
    }

    const existingRestriction = restrictions.find(
      r => r.participantId === selectedParticipant
    );

    if (existingRestriction) {
      setRestrictions(
        restrictions.map(r =>
          r.participantId === selectedParticipant
            ? { ...r, cannotGiveTo: selectedRestrictions }
            : r
        )
      );
    } else {
      setRestrictions([
        ...restrictions,
        {
          participantId: selectedParticipant,
          cannotGiveTo: selectedRestrictions
        }
      ]);
    }

    setSelectedParticipant('');
    setSelectedRestrictions([]);
  };

  const handleRemoveRestriction = (participantId: string) => {
    setRestrictions(restrictions.filter(r => r.participantId !== participantId));
  };

  const handlePerformDraw = () => {
    if (participants.length !== 13) {
      setError('Debes tener exactamente 13 participantes');
      return;
    }

    try {
      const assignments = performDraw(participants, restrictions);
      
      if (!assignments) {
        setError(
          'No se pudo realizar el sorteo con las restricciones actuales. Intenta modificar las restricciones.'
        );
        return;
      }

      saveDrawResult(assignments);
      setSuccess(true);
      setDrawCompleted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al realizar el sorteo');
    }
  };

  const getParticipantName = (id: string): string => {
    return participants.find(p => p.id === id)?.name || '';
  };

  const getAvailableRestrictionsForParticipant = (participantId: string) => {
    return participants.filter(p => p.id !== participantId);
  };

  const handleRestrictionsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedRestrictions(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
        🎁 Sorteo de Intercambio de Regalos
      </Typography>

      <Card sx={{ mt: 4, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Agregar Participantes ({participants.length}/13)
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Nombre del participante"
              value={currentName}
              onChange={(e) => setCurrentName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddParticipant()}
              disabled={participants.length >= 13}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddParticipant}
              disabled={participants.length >= 13}
            >
              Agregar
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {participants.map((participant) => (
              <Chip
                key={participant.id}
                label={participant.name}
                onDelete={() => handleRemoveParticipant(participant.id)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {participants.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Restricciones (Opcional)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Define quién NO puede regalar a quién
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>¿Quién no puede regalar?</InputLabel>
                <Select
                  value={selectedParticipant}
                  onChange={(e) => setSelectedParticipant(e.target.value)}
                  label="¿Quién no puede regalar?"
                >
                  {participants.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedParticipant && (
                <FormControl fullWidth>
                  <InputLabel>¿A quién NO puede regalar?</InputLabel>
                  <Select
                    multiple
                    value={selectedRestrictions}
                    onChange={handleRestrictionsChange}
                    input={<OutlinedInput label="¿A quién NO puede regalar?" />}
                    renderValue={(selected) =>
                      selected.map(id => getParticipantName(id)).join(', ')
                    }
                  >
                    {getAvailableRestrictionsForParticipant(selectedParticipant).map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Button
                variant="outlined"
                onClick={handleAddRestriction}
                disabled={!selectedParticipant || selectedRestrictions.length === 0}
              >
                Agregar Restricción
              </Button>
            </Box>

            {restrictions.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Restricciones Actuales:
                </Typography>
                {restrictions.map((restriction) => (
                  <Box
                    key={restriction.participantId}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1,
                      mb: 1,
                      bgcolor: 'background.default',
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="body2">
                      <strong>{getParticipantName(restriction.participantId)}</strong>
                      {' '}no puede regalar a:{' '}
                      {restriction.cannotGiveTo.map(id => getParticipantName(id)).join(', ')}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveRestriction(restriction.participantId)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<Casino />}
          onClick={handlePerformDraw}
          disabled={participants.length !== 13 || drawCompleted}
          sx={{ px: 6, py: 2 }}
        >
          Realizar Sorteo
        </Button>
      </Box>

      {drawCompleted && (
        <Alert severity="success" sx={{ mt: 3 }}>
          ¡Sorteo completado! Ahora puedes generar los enlaces para cada participante.
          Ve a la sección de "Ver Enlaces" para compartir los resultados.
        </Alert>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          ¡Sorteo realizado exitosamente!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminPanel;
