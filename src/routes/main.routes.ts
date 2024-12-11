import { Router, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
    res.json([{ messages:"Get Data success" }]);
});

export default router;
