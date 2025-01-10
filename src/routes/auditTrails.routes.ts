import { Router, Request, Response, NextFunction } from 'express';
import {
    getTransactionLogs,
    addTransactionLogs,
} from '../controlers/auditTrails.contolers';

const router: Router = Router();

router.post('/transaction-log', getTransactionLogs);

router.post('/create-transaction-log', addTransactionLogs);

export default router;
