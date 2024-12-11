import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router: Router = Router();

router.get('/web-token', (req: Request, res: Response) => {

    let payload:{ [key: string]: any;} = {
        user: {
            userId: 'anbya_ali',
            userName: '',
            firstName: '',
            lastName: '',
            userEmail: 'anbya_ali@globalnet.lcl'
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
    res.json([{ status:"Token create successfully" }]);
});

router.get('/app-token', (req: Request, res: Response) => {

    let payload:{ [key: string]: any;} = {
        userId: "anbya_ali", 
        role:"assistant", 
        name: "anbya army ali"
    };
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, {
        expiresIn: "86400s",
    });

    let response:{ [key: string]: any;} = {
        userId: "anbya_ali", 
        role:"assistant", 
        name: "anbya army ali",
        token:token
    };
    res.json([{ status:"Token create successfully", data:response }]);
});

export default router;
