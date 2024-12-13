import { Router } from 'express';
import authRoutes from './auth.routes';
import mainRoutes from './main.routes';
import usersRoutes from './users.routes';

import { authenticateWebToken, authenticateAppToken } from '../middleware/token';

const router: Router = Router();

router.get('/', (req, res) => {
    res.send('Welcome to TypeScript REST API!');
});

router.use('/auth', authRoutes);
router.use('/main', mainRoutes);
router.use('/users', authenticateAppToken, usersRoutes);

export default router;
