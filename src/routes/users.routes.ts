import { Router } from 'express';
import {
    getControlers,
    addControlers,
    updateControlers,
    deleteControlers
} from '../controlers/users.contolers';

const router: Router = Router();

router.get('/', getControlers);

router.post('/', addControlers);

router.put('/:id', updateControlers);

router.delete('/:id', deleteControlers);

export default router;
