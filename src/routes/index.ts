import { Router } from 'express';
import mainRoutes from './main.routes';
import authRoutes from './auth.routes';

const router: Router = Router();

router.get('/', (req, res) => {
    res.send('Welcome to TypeScript REST API!');
});

router.use('/auth', authRoutes);
router.use('/main', mainRoutes);

export default router;
