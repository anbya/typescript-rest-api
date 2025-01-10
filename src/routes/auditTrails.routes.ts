import { Router, Request, Response, NextFunction } from 'express';
import {
    getTransactionLogs,
    addTransactionLogs,
    updateTransactionLogs,
    getActionLogs,
} from '../controlers/auditTrails.contolers';

const router: Router = Router();

router.post('/transaction-log', getTransactionLogs);

router.post('/create-transaction-log', addTransactionLogs);

router.post('/update-transaction-log/:id', updateTransactionLogs);

router.post('/action-log', getActionLogs);

export default router;
