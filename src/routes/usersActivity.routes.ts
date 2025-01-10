import { Router, Request, Response, NextFunction } from 'express';
import {
    GetUserActivities,
    GetUserVisit,
    GetUserLastActiveGraph,
    GetUserLastActiveMiniGraph,
    GetUserActiveDetail,
    AddUserActivity,
    GetUserActiveMiniGraphDetail,
    GetVisitDurationData,
    GetExcludedUser,
    GetUserActivitiesRules,
    UpdateUserActivitiesRule,
    AddMultipleExcludeUser,
    UpdateExcludeUserStatus,
    getUserPanel,
} from '../controlers/usersActivity.contolers';

const router: Router = Router();

router.get('/user-activities', GetUserActivities);

router.get('/user-visit', GetUserVisit);

router.get('/user-active-graph', GetUserLastActiveGraph);

router.get('/user-active-mini-graph', GetUserLastActiveMiniGraph);

router.get('/user-active-detail', GetUserActiveDetail);

router.get('/user-active-mini-graph-details', GetUserActiveMiniGraphDetail);

router.get('/visit-duration', GetVisitDurationData);

router.get('/users', getUserPanel);

router.get('/excluded-user', GetExcludedUser);

router.post('/excluded-user', AddMultipleExcludeUser);

router.put('/excluded-user', UpdateExcludeUserStatus);

router.get('/user-activities-rules', GetUserActivitiesRules);

router.put('/user-activities-rules', UpdateUserActivitiesRule);

router.post('/', AddUserActivity);

export default router;
