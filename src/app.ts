import express from 'express';
import path from 'path';
import { connectDB } from './database';
import routes from './routes';
import { errorHandler, authenticateToken } from './middleware';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api', routes);

// Protect the dashboard route
app.get('/dashboard.html', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// Serve login.html as the default route
app.use('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});
// Serve login.html explicitly
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});
// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});