import { Request, Response, NextFunction } from 'express';
import {
    CustomWebRequest,
    CustomAppRequest
} from '../middleware/token';
import {
    getTransactionLogsService,
    addTransactionLogsService,
} from '../services/auditTrails.services';

interface dataToPass {
    [key: string]: any;
}

// User Activity

export const getTransactionLogs = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const queryData = customAppReq.body as dataToPass
        const result  = await getTransactionLogsService(queryData)
        res.send({
            data:result,
            total:result.length
        })
    } catch(error){
        next(error);
    }
};

export const addTransactionLogs = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const queryData = customAppReq.body as dataToPass
        const result  = await addTransactionLogsService(queryData)
        res.send(result)
    } catch(error){
        next(error);
    }
};