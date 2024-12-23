import { Request, Response, NextFunction } from 'express';
import {
    CustomWebRequest,
    CustomAppRequest
} from '../middleware/token';
import {
    getServices,
    getByPKServices,
    addServices,
    updateServices,
    deleteServices
} from '../services/staffs.services';

export const getControlers = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const result  = await getServices()
        res.json(result.result);
    } catch(error){
        next(error);
    }
};

export const getByPKControlers = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const id = parseInt(customAppReq.params.id)
        const result  = await getByPKServices(id)
        res.json(result.result);
    } catch(error){
        next(error);
    }
};

export const addControlers = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const userId = customAppReq.body.userId
        const password = customAppReq.body.password
        const sector = customAppReq.body.sector
        const result  = await addServices(userId,password,sector)
        res.json(result.result);
    } catch(error){
        next(error);
    }
};

export const updateControlers = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const id = parseInt(customAppReq.params.id)
        const password = customAppReq.body.password
        const sector = customAppReq.body.sector
        const result  = await updateServices(id,password,sector)
        res.json(result.result);
    } catch(error){
        next(error);
    }
};

export const deleteControlers = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const id = parseInt(customAppReq.params.id)
        const result  = await deleteServices(id)
        res.json(result.result);
    } catch(error){
        next(error);
    }
};