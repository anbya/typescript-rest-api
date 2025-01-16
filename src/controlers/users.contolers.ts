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

interface dataToPass {
    [key: string]: any;
}

export const getControlers = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const queryData = customAppReq.query as dataToPass
        const result  = await getServices(queryData)

        for (const data of result.data) {
            delete data.password
        }

        res.status(200).send({
            success: true,
            status: 'success',
            statusCode: 200,
            message: 'request completed',
            data: result.data,
            page: result.page,
            perPage: result.perPage,
            total: result.total,
            orderData: result.orderData,
            orderDirection: result.orderDirection,
        })
    } catch(error){
        next(error);
    }
};

export const addControlers = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const { name, email, password } = customAppReq.body;
        const result  = await addServices( name, email, password )
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
