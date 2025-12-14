import { useState, useEffect } from "react";
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
  Tooltip,
} from "@mui/material";
import { ContentCopy, Link as LinkIcon } from "@mui/icons-material";
import { getDrawList, clearDraw } from "../utils/storage";

const LinksView = () => {
  // Simula la carga de assignments desde draws
  const handleLoadLinks = () => {
    // Junta todos los assignments de todos los sorteos
    const allAssignments = draws.flatMap((draw) =>
      draw.assignments.map((a: any) => ({
        ...a,
        drawName: draw.name || "Sorteo",
        drawId: draw.id,
        createdAt: draw.createdAt,
      }))
    );
    setAssignments(allAssignments);
    setLoaded(true);
  };
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [draws, setDraws] = useState(getDrawList());
  const [assignments, setAssignments] = useState<
    Array<{ token: string; giver: string; accessed?: boolean }>
  >([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setDraws(getDrawList());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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
      console.error("Error al copiar:", err);
    }
  };

  const handleClearDraw = () => {
    clearDraw();
    setAssignments([]);
    setLoaded(false);
    setDraws([]);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        align="center"
        color="primary"
      >
        Enlaces para Participantes
      </Typography>

      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography
          variant="h6"
          className="text-primary"
          style={{ fontWeight: "bold", fontSize: "1.1rem" }}
        >
          Sorteos guardados
        </Typography>
        <Card
          sx={{
            bgcolor: "#f5f6fa",
            borderRadius: 2,
            boxShadow: 1,
            p: 2,
            mt: 1,
          }}
        >
          <List>
            {draws.map((draw) => (
              <ListItem
                key={draw.id}
                sx={{
                  borderBottom: "1px solid #e0e0e0",
                  "&:last-child": { borderBottom: "none" },
                }}
              >
                <ListItemText
                  primary={
                    <span style={{ color: "#0d1a3a", fontWeight: 600 }}>
                      {draw.name ? draw.name : "Sorteo"}
                    </span>
                  }
                  secondary={
                    <span style={{ color: "#185adb" }}>
                      {draw.createdAt
                        ? new Date(draw.createdAt).toLocaleString()
                        : ""}
                    </span>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Card>
      </Box>

      {!loaded ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
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
            Comparte estos enlaces con cada participante. Cada enlace solo puede
            abrirse una vez.
          </Alert>

          <Card>
            <CardContent>
              <List>
                {assignments.map((assignment: any) => (
                  <ListItem
                    key={assignment.token}
                    sx={{
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      "&:last-child": { borderBottom: "none" },
                    }}
                    secondaryAction={
                      <Tooltip
                        title={
                          copiedToken === assignment.token
                            ? "¡Copiado!"
                            : "Copiar enlace"
                        }
                      >
                        <IconButton
                          edge="end"
                          onClick={() => handleCopyLink(assignment.token)}
                          color={
                            copiedToken === assignment.token
                              ? "success"
                              : "default"
                          }
                        >
                          <ContentCopy />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemText
                      primary={
                        <>
                          <Typography variant="h6" component="span">
                            {assignment.giver}
                          </Typography>
                          <Typography
                            variant="body2"
                            component="span"
                            sx={{ ml: 2, color: "#888" }}
                          >
                            {assignment.drawName}
                          </Typography>
                        </>
                      }
                      secondary={
                        <Box component="span" sx={{ display: "block", mt: 1 }}>
                          <Typography
                            variant="body2"
                            component="span"
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "0.75rem",
                              bgcolor: "background.default",
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              display: "inline-block",
                              wordBreak: "break-all",
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

          <Box sx={{ textAlign: "center", mt: 2 }}>
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
