import { Router } from 'express';
import authRoutes from './auth.routes';
import mainRoutes from './main.routes';
import usersRoutes from './users.routes';
import staffsRoutes from './staffs.routes';
import usersActivityRoutes from './usersActivity.routes';
import auditTrailsRoutes from './auditTrails.routes';

import { authenticateWebToken, authenticateAppToken } from '../middleware/token';

const router: Router = Router();

router.get('/', (req, res) => {
    res.send('Welcome to TypeScript REST API!');
});

router.use('/auth', authRoutes);
router.use('/main', mainRoutes);
router.use('/users', authenticateAppToken, usersRoutes);
router.use('/staffs', authenticateAppToken, staffsRoutes);
router.use('/user-activity', authenticateAppToken, usersActivityRoutes);
router.use('/audit-trails', authenticateAppToken, auditTrailsRoutes);

export default router;
