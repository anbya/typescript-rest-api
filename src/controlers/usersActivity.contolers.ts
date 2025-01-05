import { Request, Response, NextFunction } from 'express';
import {
    CustomWebRequest,
    CustomAppRequest
} from '../middleware/token';
import {
    GetUserActivitiesServices,
} from '../services/usersActivity.services';

interface dataToPass {
    [key: string]: any;
}

// User Activity

export const GetUserActivities = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const queryData = customAppReq.query as dataToPass
        const result  = await GetUserActivitiesServices(queryData)
        res.json(result);
    } catch(error){
        next(error);
    }
};