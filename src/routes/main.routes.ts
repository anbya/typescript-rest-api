import { Router } from 'express';
import { authenticateWebToken, CustomWebRequest, authenticateAppToken, CustomAppRequest } from '../middleware/token';

const router: Router = Router();

router.get('/web', authenticateWebToken, async (req, res) => {
    const customWebReq = req as CustomWebRequest
    res.json([{ status:"success", userData:customWebReq.user }]);
});

router.get('/app', authenticateAppToken, async (req, res) => {
    const customAppReq = req as CustomAppRequest
    res.json([{ status:"success", userData:customAppReq.user }]);
});

export default router;
