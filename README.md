# Gift Exchange Sorteo

Una aplicación web para organizar sorteos de intercambio de regalos con restricciones personalizables.

## Características

- ✅ Validación de exactamente 13 participantes
- 🚫 Sistema de restricciones (quién NO puede regalar a quién)
- 🔐 Enlaces únicos de un solo uso para cada participante
- 🎨 Interfaz moderna con Material UI
- 📱 Diseño responsivo
- 💾 Almacenamiento local del sorteo

## Tecnologías

- React 18
- TypeScript
- Material UI (MUI)
- React Router
- Vite

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Uso

1. **Agregar participantes**: Ingresa exactamente 13 nombres en la página principal
2. **Configurar restricciones** (opcional): Define quién no puede regalarle a quién
3. **Realizar sorteo**: Haz clic en "Realizar Sorteo" para generar las asignaciones
4. **Compartir enlaces**: Ve a "Ver Enlaces" y comparte cada URL con su respectivo participante
5. **Ver resultado**: Cada participante abrirá su enlace único para ver a quién le toca regalar

## Seguridad

- Cada enlace solo puede ser abierto una vez
- Las asignaciones se marcan como "accedidas" después del primer acceso
- El sistema previene que alguien vea información de otros participantes

## Estructura del Proyecto

```
src/
├── components/
│   ├── AdminPanel.tsx      # Panel de configuración del sorteo
│   ├── LinksView.tsx        # Vista de enlaces generados
│   └── ResultView.tsx       # Vista del resultado individual
├── types/
│   └── index.ts             # Definiciones de tipos TypeScript
├── utils/
│   ├── drawEngine.ts        # Lógica del algoritmo de sorteo
│   └── storage.ts           # Gestión de localStorage
└── App.tsx                  # Componente principal con rutas
```

## Licencia

MIT
