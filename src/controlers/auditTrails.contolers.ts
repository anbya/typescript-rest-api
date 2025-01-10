import { Request, Response, NextFunction } from 'express';
import {
    CustomWebRequest,
    CustomAppRequest
} from '../middleware/token';
import {
    getTransactionLogsService,
    addTransactionLogsService,
    updateTransactionLogsService,
    getActionLogsService,
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

export const updateTransactionLogs = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const queryData = customAppReq.body as dataToPass
        const paramData = customAppReq.params as dataToPass
        const result  = await updateTransactionLogsService(queryData,paramData.id)
        res.send(result)
    } catch(error){
        next(error);
    }
};

export const getActionLogs = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const queryData = customAppReq.body as dataToPass
        const result  = await getActionLogsService(queryData)
        res.send({
            data:result,
            total:result.length
        })
    } catch(error){
        next(error);
    }
};