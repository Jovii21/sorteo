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
  Switch,
  FormControlLabel,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { Add, Delete, Casino } from '@mui/icons-material';
import type { Participant, Restriction, DrawResult } from '../types';
import { performDraw } from '../utils/drawEngine';
import { saveDrawResult, getDrawList, getActiveDrawId, setActiveDrawId, clearDraws } from '../utils/storage';
import { texts } from '../constants/texts';
import '../styles/colors.scss';

const AdminPanel = () => {
  // Participantes por defecto
  const defaultNames = [
    'Segundo', 'Dorys', 'Carlos', 'Susanita', 'Juni', 'Ita', 'Jeank', 'Keyla', 'Charlie', 'Grace', 'Freddy', 'Ivo', 'George'
  ];
  const defaultParticipants = defaultNames.map((name, idx) => ({
    id: `p-${idx}`,
    name
  }));
  const defaultRestrictions = [
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

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentName, setCurrentName] = useState('');
  const [restrictions, setRestrictions] = useState<Restriction[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState('');
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [drawCompleted, setDrawCompleted] = useState(false);
  const [draws, setDraws] = useState<DrawResult[]>(getDrawList());
  const [activeDrawId, setActiveDrawIdState] = useState<string | null>(getActiveDrawId());
  const [listName, setListName] = useState('');

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

      saveDrawResult(assignments, listName);
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

  const handleSelectDraw = (id: string) => {
    setActiveDrawId(id);
    setActiveDrawIdState(id);
  };

  const handleClearAllDraws = () => {
    clearDraws();
    setDraws([]);
    setActiveDrawIdState(null);
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 6 }, px: { xs: 1, sm: 0 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, md: 4 }, alignItems: { xs: 'stretch', md: 'flex-start' } }}>
        <Box sx={{ flex: 1 }}>
          <Card sx={{ mt: { xs: 2, md: 4 }, mb: 3, bgcolor: '#fff', boxShadow: 2, borderRadius: 2, minWidth: { xs: '100%', md: 500 } }}>
            <CardContent>
              <Typography variant="h4" gutterBottom align="center" color="primary" sx={{ fontSize: { xs: '1.5rem', sm: '2.2rem', md: '2.8rem' } }}>
                🎁 {texts.appTitle}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 2, sm: 3 } }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={participants.length === defaultParticipants.length && restrictions.length === defaultRestrictions.length}
                      onChange={(_, checked) => {
                        if (checked) {
                          setParticipants(defaultParticipants);
                          setRestrictions(defaultRestrictions);
                          setListName('Intercambio de Regalos de Navidad');
                        } else {
                          setParticipants([]);
                          setRestrictions([]);
                          setListName('');
                        }
                      }}
                      color="primary"
                      sx={{
                        '& .MuiSwitch-thumb': { bgcolor: '#0d1a3a' },
                        '& .MuiSwitch-track': { bgcolor: '#185adb' },
                      }}
                    />
                  }
                  label={<Typography sx={{ fontWeight: 'bold', color: '#0d1a3a', fontSize: { xs: '1rem', sm: '1.1rem' } }}>Cargar lista por defecto</Typography>}
                  sx={{ mx: 'auto' }}
                />
              </Box>
              <TextField
                fullWidth
                label={texts.admin.listLabel}
                value={listName}
                onChange={e => setListName(e.target.value)}
                placeholder={texts.admin.listPlaceholder}
                variant="outlined"
                InputLabelProps={{
                  style: {
                    color: '#0d1a3a', fontWeight: 600, fontSize: '1.1rem', background: '#fff', padding: '0 4px', borderRadius: 4, marginLeft: 8
                  }
                }}
                inputProps={{
                  style: {
                    fontSize: '1.1rem', padding: '14px 16px', color: '#0d1a3a', fontWeight: 500
                  }
                }}
                sx={{
                  mb: { xs: 2, sm: 3 },
                  bgcolor: '#fff',
                  borderRadius: 1,
                  boxShadow: '0 2px 8px rgba(24,90,219,0.08)',
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#fff',
                    borderRadius: 1,
                    border: '1.5px solid #0d1a3a',
                    boxShadow: '0 2px 8px rgba(24,90,219,0.08)',
                    '&:hover': {
                      borderColor: '#14305c',
                    },
                    '&.Mui-focused': {
                      borderColor: '#14305c',
                      boxShadow: '0 0 0 2px rgba(20,48,92,0.15)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#0d1a3a',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                }}
              />
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label={texts.admin.participantLabel}
                  value={currentName}
                  onChange={(e) => setCurrentName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddParticipant()}
                  placeholder={texts.admin.participantPlaceholder}
                  variant="outlined"
                  InputLabelProps={{
                    style: {
                      color: '#0d1a3a', fontWeight: 600, fontSize: '1.1rem', background: '#fff', padding: '0 4px', borderRadius: 4, marginLeft: 8
                    }
                  }}
                  inputProps={{
                    style: {
                      fontSize: '1.1rem', padding: '14px 16px', color: '#0d1a3a', fontWeight: 500
                    }
                  }}
                  sx={{
                    bgcolor: '#fff',
                    borderRadius: 1,
                    boxShadow: '0 2px 8px rgba(24,90,219,0.08)',
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#fff',
                      borderRadius: 1,
                      border: '1.5px solid #0d1a3a',
                      boxShadow: '0 2px 8px rgba(24,90,219,0.08)',
                      '&:hover': {
                        borderColor: '#14305c',
                      },
                      '&.Mui-focused': {
                        borderColor: '#14305c',
                        boxShadow: '0 0 0 2px rgba(20,48,92,0.15)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#0d1a3a',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddParticipant}
                  sx={{ bgcolor: '#0d1a3a', color: '#fff', fontWeight: 'bold', borderRadius: 1, px: { xs: 2, sm: 4 }, py: { xs: 1, sm: 1.5 }, fontSize: { xs: '0.95rem', sm: '1rem' }, boxShadow: 2, '&:hover': { bgcolor: '#14305c' } }}
                >
                  {texts.admin.add}
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, bgcolor: '#fff', p: { xs: 1, sm: 2 }, borderRadius: 2 }}>
                {participants.map((participant) => (
                  <Chip
                    key={participant.id}
                    label={participant.name}
                    onDelete={() => handleRemoveParticipant(participant.id)}
                    color="primary"
                    variant="outlined"
                    sx={{ bgcolor: '#f5f6fa', color: '#0d1a3a', fontWeight: 'bold', fontSize: { xs: '0.95rem', sm: '1rem' }, mb: 1, border: 'none', boxShadow: 1 }}
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Casino />}
                  onClick={handlePerformDraw}
                  disabled={participants.length < 2 || drawCompleted}
                  sx={{ px: 6, py: 2, bgcolor: '#0d1a3a', color: '#fff', fontWeight: 'bold', borderRadius: 2, '&:hover': { bgcolor: '#1976d2' } }}
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
            </CardContent>
          </Card>
        </Box>
        <Card sx={{ minWidth: 400, maxWidth: 600, bgcolor: '#fff', boxShadow: 2, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="secondary.main" fontWeight="bold">
              Restricciones (Opcional)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Define quién <b>NO</b> puede regalar a quién
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
                sx={{ bgcolor: '#0d1a3a', color: '#fff', fontWeight: 'bold', borderRadius: 2, '&:hover': { bgcolor: '#1976d2' } }}
              >
                Agregar Restricción
              </Button>
            </Box>
            {restrictions.length > 0 && (
              <Box sx={{ mt: 3, bgcolor: '#fff', borderRadius: 2, p: 2, boxShadow: 2 }}>
                <Typography variant="subtitle2" gutterBottom color="secondary.main" fontWeight="bold">
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
                      bgcolor: 'grey.100',
                      borderRadius: 2,
                      boxShadow: 1
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'primary.dark', fontWeight: 'bold' }}>
                      <strong>{getParticipantName(restriction.participantId)}</strong>
                      {' '}no puede regalar a:{' '}
                      {restriction.cannotGiveTo.map(id => getParticipantName(id)).join(', ')}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveRestriction(restriction.participantId)}
                      sx={{ color: 'error.main' }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
      {/* Selector de sorteos guardados */}
      {draws.length > 0 && (
        <Card sx={{ mb: 3, bgcolor: 'background.paper', boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Sorteos guardados
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {draws.map(draw => (
                <Button
                  key={draw.id}
                  variant={draw.id === activeDrawId ? 'contained' : 'outlined'}
                  color={draw.id === activeDrawId ? 'primary' : 'inherit'}
                  onClick={() => handleSelectDraw(draw.id)}
                  sx={{ textAlign: 'left', justifyContent: 'flex-start' }}
                >
                  {draw.name ? draw.name : 'Sorteo'} - {draw.createdAt.toLocaleString()}
                </Button>
              ))}
            </Box>
            <Button variant="text" color="error" onClick={handleClearAllDraws} sx={{ mt: 2 }}>
              Borrar todos los sorteos
            </Button>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default AdminPanel;
