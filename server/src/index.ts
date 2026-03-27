import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import authRoutes from './routes/authRoutes';
import emergencyRoutes from './routes/emergencyRoutes';
import feedRoutes from './routes/feedRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.send('Suraksha+ API is running...');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/emergency', emergencyRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
