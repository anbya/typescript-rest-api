import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {
    CustomAppRequest
} from '../middleware/token';
import {
    getServices,
} from '../services/users.services';
import {
    validatePassword,
} from '../utils/password';
import { decryptData } from '../utils/encryption';
import {
    generateAppToken,
} from '../utils/token';

interface User {
    userId: string;
    [key: string]: any;
}

interface dataToPass {
    [key: string]: any;
}

export const webLoginControlers = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const bodyData = customAppReq.body as dataToPass
        const queryData:dataToPass = {
            email:bodyData.email
        }
        const userResult  = await getServices(queryData)
        if(userResult.data.length>0){
            let userData = {...userResult.data[0]}
            delete userData.password
            const decryptedPassword = decryptData(bodyData.password)
            const hashedPassword = userResult.data[0].password
            const validateResult = await validatePassword(`${decryptedPassword}`,`${hashedPassword}`)
            if(validateResult){
            
                let payload:{ [key: string]: any;} = {
                    user: {
                        userId: userResult.data[0].id,
                        userName: userResult.data[0].name,
                        firstName: '',
                        lastName: '',
                        userEmail: userResult.data[0].email
                    },
                };
                const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, {
                    expiresIn: "30m",
                });
                const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string)
            
                res.setHeader("content-type", "application/json");
                res.cookie("accessToken", accessToken, {
                    maxAge: 30 * 60 * 1000,
                    httpOnly: true
                });
                res.cookie("refreshToken", refreshToken, {
                    maxAge: 5 * 24 * 60 * 60 * 1000,
                    httpOnly: true
                });
                res.status(200).send({
                    success: true,
                    status: 'success',
                    statusCode: 200,
                    message: 'Login success',
                    user:userData
                })
            } else {
                res.status(200).send({
                    success: false,
                    status: 'failed',
                    statusCode: 200,
                    message: 'Login failed.'
                })
            }
        } else {
            res.status(200).send({
                success: false,
                status: 'failed',
                statusCode: 200,
                message: 'Login failed.'
            })
        }
    } catch(error){
        next(error);
    }
};

export const generateNewWebToken = async (req: Request, res: Response, next: NextFunction) => {
    const customWebReq = req as CustomAppRequest
    const refreshToken = customWebReq.cookies?.refreshToken;

    if (!refreshToken) {
        res.status(401).json({
            message:"Cannot find token"
        });
        return;
    } else {
        const jwtDecode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as User
        console.log(`check jwtDecode`, jwtDecode);
            
        let payload:{ [key: string]: any;} = {
            user: jwtDecode.user,
        };
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, {
            expiresIn: "30m",
        });
        const newRefreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string)
    
        res.setHeader("content-type", "application/json");
        res.cookie("accessToken", accessToken, {
            maxAge: 30 * 60 * 1000,
            httpOnly: true
        });
        res.cookie("refreshToken", newRefreshToken, {
            maxAge: 5 * 24 * 60 * 60 * 1000,
            httpOnly: true
        });
        res.json({ success: true });
    }
    // try{
    //     res.status(200).send({
    //         success: false,
    //         status: 'failed',
    //         statusCode: 200,
    //         message: 'Login failed.'
    //     })
    // } catch(error){
    //     next(error);
    // }
};

export const appLoginControlers = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const bodyData = customAppReq.body as dataToPass
        const queryData:dataToPass = {
            email:bodyData.email
        }
        const userResult  = await getServices(queryData)
        if(userResult.data.length>0){
            const decryptedPassword = decryptData(bodyData.password)
            const hashedPassword = userResult.data[0].password
            const validateResult = await validatePassword(`${decryptedPassword}`,`${hashedPassword}`)
            
            let payload:{ [key: string]: any;} = {
                userId: userResult.data[0].name,
                userName: userResult.data[0].name,
                firstName: '',
                lastName: '',
                userEmail: userResult.data[0].email
            };
            const token = generateAppToken(payload)
            if(validateResult){
                let response:{ [key: string]: any;} = {
                    userId: userResult.data[0].name, 
                    role:"assistant", 
                    name: userResult.data[0].name,
                    email:userResult.data[0].email,
                    token:token
                };
                res.status(200).send({
                    success: true,
                    status: 'success',
                    statusCode: 200,
                    message: 'Login success',
                    data:response
                })
            } else {
                res.status(200).send({
                    success: false,
                    status: 'failed',
                    statusCode: 200,
                    message: 'Login failed.'
                })
            }
        } else {
            res.status(200).send({
                success: false,
                status: 'failed',
                statusCode: 200,
                message: 'Login failed.'
            })
        }
    } catch(error){
        next(error);
    }
};
