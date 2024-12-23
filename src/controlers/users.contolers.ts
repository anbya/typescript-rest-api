import { Request, Response, NextFunction } from 'express';
import {
    CustomWebRequest,
    CustomAppRequest
} from '../middleware/token';
import {
    getServices,
    addServices,
    updateServices,
    deleteServices
} from '../services/users.services';

export const getControlers = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const result  = await getServices()
        res.json(result.result);
    } catch(error){
        next(error);
    }
};

export const addControlers = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const { name, email } = customAppReq.body;
        const result  = await addServices( name, email )
        res.json(result.result);
    } catch(error){
        next(error);
    }
};

export const updateControlers = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const { name, email } = customAppReq.body;
        const { id } = customAppReq.params;
        const result  = await updateServices( id, name, email )
        res.json(result.result);
    } catch(error){
        next(error);
    }
};

export const deleteControlers = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const { id } = customAppReq.params;
        const result  = await deleteServices(id)
        res.json(result.result);
    } catch(error){
        next(error);
    }
};
