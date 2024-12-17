import { Router } from 'express';
import {
    getControlers,
    getByPKControlers,
    addControlers,
    updateControlers,
    deleteControlers
} from '../controlers/staffs.contolers';

const router: Router = Router();

router.get('/', getControlers);

router.get('/:id', getByPKControlers);

router.post('/', addControlers);

router.put('/:id', updateControlers);

router.delete('/:id', deleteControlers);

export default router;
