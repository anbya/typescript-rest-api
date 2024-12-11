import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface User {
    userId: string;
    [key: string]: any;
}
  
export interface CustomWebRequest extends Request {
    user?: User;
    [key: string]: any;
}
  
export interface CustomAppRequest extends Request {
    [key: string | number]: any;
}

export const authenticateWebToken = async (req: Request, res: Response, next: NextFunction) => {
    const customWebReq = req as CustomWebRequest
    const token = customWebReq.cookies?.accessToken;
    const secretKey = process.env.ACCESS_TOKEN_SECRET as string;

    if (!token) {
        res.status(401).json({
            message:"Cannot find token"
        });
        return;
    }

    try{
        const jwtDecode = jwt.verify(token,secretKey)
        if(typeof jwtDecode !== 'string'){
            customWebReq.user = jwtDecode.user as User
        }
    } catch (error) {
        res.status(401).json({
            message:"Unauthorized"
        });
        return;
    }
    next()
};

export const authenticateAppToken = async (req: Request, res: Response, next: NextFunction) => {
    const customAppReq = req as CustomAppRequest
    const bearerHeader = customAppReq.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];

        try{
            const jwtDecode = jwt.verify(bearerToken, process.env.ACCESS_TOKEN_SECRET as string)
            if(typeof jwtDecode !== 'string'){
                if (jwtDecode.userId) {
                    customAppReq.user = jwtDecode as User
                } else {
                    res.status(403).json({
                        message:"Forbidden"
                    });
                    return;
                }
            }
        } catch (error) {
            res.status(403).json({
                message:"Forbidden"
            });
            return;
        }
        next();
    } else {
        res.status(401).json({
            message:"Unauthorized"
        });
        return;
    }
};
