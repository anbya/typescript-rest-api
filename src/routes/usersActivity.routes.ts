import { Router } from 'express';
import {
    GetUserActivities,
} from '../controlers/usersActivity.contolers';

const router: Router = Router();

router.post('/', GetUserActivities);

router.get('/user-activities', GetUserActivities);

router.get('/user-visit', GetUserActivities);

router.get('/user-active-graph', GetUserActivities);

router.get('/user-active-mini-graph', GetUserActivities);

router.get('/user-active-detail', GetUserActivities);

router.get('/user-active-mini-graph-details', GetUserActivities);

router.get('/visit-duration', GetUserActivities);

router.get('/users', GetUserActivities);

router.get('/excluded-user', GetUserActivities);

router.post('/excluded-user', GetUserActivities);

router.put('/excluded-user', GetUserActivities);

router.get('/user-activities-rules', GetUserActivities);

router.put('/user-activities-rules', GetUserActivities);

export default router;
