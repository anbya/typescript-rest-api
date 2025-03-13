import express, { Application, Request, Response, NextFunction  } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import routes from './routes';

import { apiLogger } from './utils/logger';
import { handleError, convertToApiError, ApiError } from './middleware/errorHandler';

dotenv.config(); // Load environment variables

const app: Application = express();

// Configuration
const PORT = process.env.PORT || 9001;
const CORS_ORIGIN = process.env.APP_DOMAIN || '*';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";// bypass openssl

// Middleware
app.use(cors({ origin: CORS_ORIGIN, credentials: true })); // Enable CORS

// BODY PARSE
app.use(express.json());
app.use(express.urlencoded({ limit: '200mb', extended: true }));

app.use(cookieParser()); // Parse cookies

app.use('/', routes);

app.use(convertToApiError);
app.use((err: ApiError, req: Request, res: Response, next: NextFunction) => {
  handleError(err, req, res, next)
})

// Start Server
app.listen(PORT, () => {
  apiLogger('info', `Server running at ${PORT}`);
  console.log(`Server running at http://localhost:${PORT}`);
});
