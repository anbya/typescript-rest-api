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
    const customAppReq = req as CustomAppRequest
    const result  = await getServices()
    if(!result.error){
      res.json(result.result);
    } else {
        res.status(500).json({ message: result.message, error: result.error });
    }
};

export const getByPKControlers = async (req: Request, res: Response, next: NextFunction) => {
    const customAppReq = req as CustomAppRequest
    const id = parseInt(customAppReq.params.id)
    const result  = await getByPKServices(id)
    if(!result.error){
      res.json(result.result);
    } else {
        res.status(500).json({ message: result.message, error: result.error });
    }
};

export const addControlers = async (req: Request, res: Response, next: NextFunction) => {
    const customAppReq = req as CustomAppRequest
    const userId = customAppReq.body.userId
    const password = customAppReq.body.password
    const sector = customAppReq.body.sector
    const result  = await addServices(userId,password,sector)
    if(!result.error){
      res.json(result.result);
    } else {
        res.status(500).json({ message: result.message, error: result.error });
    }
};

export const updateControlers = async (req: Request, res: Response, next: NextFunction) => {
    const customAppReq = req as CustomAppRequest
    const id = parseInt(customAppReq.params.id)
    const password = customAppReq.body.password
    const sector = customAppReq.body.sector
    const result  = await updateServices(id,password,sector)
    if(!result.error){
      res.json(result.result);
    } else {
        res.status(500).json({ message: result.message, error: result.error });
    }
};

export const deleteControlers = async (req: Request, res: Response, next: NextFunction) => {
    const customAppReq = req as CustomAppRequest
    const id = parseInt(customAppReq.params.id)
    const result  = await deleteServices(id)
    if(!result.error){
      res.json(result.result);
    } else {
        res.status(500).json({ message: result.message, error: result.error });
    }
};