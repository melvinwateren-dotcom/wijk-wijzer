import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import addressRoutes from './routes/address.js';
import buildingRoutes from './routes/building.js';
import neighborhoodRoutes from './routes/neighborhood.js';
import risksRoutes from './routes/risks.js';
import noiseRoutes from './routes/noise.js';
import crimeRoutes from './routes/crime.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:5173',
}));

app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/address', addressRoutes);
app.use('/api/building', buildingRoutes);
app.use('/api/neighborhood', neighborhoodRoutes);
app.use('/api/risks', risksRoutes);
app.use('/api/noise', noiseRoutes);
app.use('/api/crime', crimeRoutes);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Interne serverfout' });
});

app.listen(PORT, () => {
  console.log(`WijkWijzer API server running on http://localhost:${PORT}`);
});
