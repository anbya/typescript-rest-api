import { Router } from 'express';
import { authenticateWebToken, CustomWebRequest, authenticateAppToken, CustomAppRequest } from '../middleware/token';
import upload from '../middleware/multer';

const router: Router = Router();

router.get('/web', authenticateWebToken, async (req, res) => {
    const customWebReq = req as CustomWebRequest
    res.json([{ status:"success", userData:customWebReq.user }]);
});

router.get('/app', authenticateAppToken, async (req, res) => {
    const customAppReq = req as CustomAppRequest
    res.json([{ status:"success", userData:customAppReq.user }]);
});

router.post('/upload', authenticateAppToken, upload.single('file'), async (req, res) => {
    const customAppReq = req as CustomAppRequest
    if (customAppReq.file) {
        res.json([{ status:"success", userData:customAppReq.user }]);
    } else {
        res.status(400).send("No file uploaded");
    }
});

export default router;
