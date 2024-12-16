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
    const customAppReq = req as CustomAppRequest
    const result  = await getServices()
    if(!result.error){
      res.json(result.result);
    } else {
        res.status(500).json({ message: result.message, error: result.error });
    }
};

export const addControlers = async (req: Request, res: Response, next: NextFunction) => {
    const customAppReq = req as CustomAppRequest
    const { name, email } = customAppReq.body;
    const result  = await addServices( name, email )
    if(!result.error){
      res.json(result.result);
    } else {
        res.status(500).json({ message: result.message, error: result.error });
    }
};

export const updateControlers = async (req: Request, res: Response, next: NextFunction) => {
    const customAppReq = req as CustomAppRequest
    const { name, email } = customAppReq.body;
    const { id } = customAppReq.params;
    const result  = await updateServices( id, name, email )
    if(!result.error){
      res.json(result.result);
    } else {
        res.status(500).json({ message: result.message, error: result.error });
    }
};

export const deleteControlers = async (req: Request, res: Response, next: NextFunction) => {
    const customAppReq = req as CustomAppRequest
    const { id } = customAppReq.params;
    const result  = await deleteServices(id)
    if(!result.error){
      res.json(result.result);
    } else {
        res.status(500).json({ message: result.message, error: result.error });
    }
};
