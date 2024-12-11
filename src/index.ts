import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import mainRoutes from './routes/main.routes';

dotenv.config(); // Load environment variables

const app: Application = express();

// Configuration
const PORT = process.env.PORT || 9001;
const CORS_ORIGIN = process.env.APP_DOMAIN || '*';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";// bypass openssl

// Middleware
app.use(cors({ origin: CORS_ORIGIN, credentials: true })); // Enable CORS
app.use(bodyParser.json({ limit: '200mb' })); // Parse JSON bodies
app.use(bodyParser.urlencoded({ limit: '200mb', extended:true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to TypeScript REST API!');
});

app.use('/main', mainRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
