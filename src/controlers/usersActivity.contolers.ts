import { Request, Response, NextFunction } from 'express';
import {
    CustomWebRequest,
    CustomAppRequest
} from '../middleware/token';
import {
    GetUserActivitiesServices,
    GetUserVisitServices,
    GetUserLastActiveDailyServices,
    GetUserLastActiveWeeklyServices,
    GetUserLastActiveMonthlyServices,
    SelectTheLongestVisitedModuleServices,
    SelectTheLongestVisitedModulePagingServices,
    SelectPageViewPerSessionServices,
    SelectPageViewPerSessionPagingServices,
    SelectTheMostVisitedModuleServices,
    SelectTheMostVisitedModulePagingServices,
    SelectTotalUserServices,
    SelectNewUserServices,
    AddUserActivityServices,
    GetVisitDurationDataServices,
    GetExcludedUserServices,
    AddMultipleExcludeUserServices,
    UpdateExcludeUserStatusServices,
    GetUserActivitiesRulesServices,
    UpdateUserActivitiesRuleServices,
    getUserPanelDataServices,
} from '../services/usersActivity.services';

const { ApiError } = require('../middleware/errorHandler')
const httpStatus = require("http-status");
const moment = require("moment");

interface dataToPass {
    [key: string]: any;
}
interface Reformat {
    xAxis: any[];
    activeUser: any[];
    usernameData: any[];
}

// User Activity

const reformatMiniGraphOverview = (array: any[], isLongest: boolean | undefined) => {
    try {
        const resultArray:any[] = []
        array.forEach(({ user_list, ...value }) => {
            const countMap:any = {};

            if (isLongest) {
                user_list.forEach((item:any) => {
                    const { username, time } = item;
                    if (countMap[username]) {
                        countMap[username] += time;
                    } else {
                        countMap[username] = time;
                    }
                });
            } else {
                user_list.forEach((username:string) => {
                    countMap[username] = (countMap[username] || 0) + 1;
                });
            }
            const formatted = Object.keys(countMap).map((username) => {
                return { username, value: countMap[username] };
            });

            resultArray.push({ ...value, user_list: formatted })

        })

        return resultArray;
    } catch (error) {
        throw (error)
    }
}

const reformatUserActiveDetail = (data:any[]) => {
    try {
        let resultTotal = 0

        if(data.length>0){
            for (const item of data) {
                resultTotal = item.total
            }
        }

        return resultTotal;
    } catch (error) {
        throw (error)
    }
}

const reformatOnlyForVisitDuration = (queryData: any,  frequency: string, mainscreen: any) => {
    const data:any = {
        title: mainscreen,
        unit: 'Minute',
        samples: [],
        sampleFrequency: frequency.toUpperCase(),
        data: []
    }

    const arr = queryData

    // Extract unique modules
    const modules = [...new Set(arr.map((entry: { modules: any; }) => entry.modules))];

    // Determine date range
    const dates = [...new Set(arr.map((entry: { datetime: any; }) => entry.datetime))];


    // Sort dates and set samples
    let dateFormat
    if (frequency === 'daily') {
        dateFormat = "DD-MM-YYYY"
    } else if (frequency === 'monthly') {
        dateFormat = "MMM YYYY"
    } else {
        dateFormat = "YYYY"
    }

    data.samples = dates
        .map(date => moment(date, dateFormat))
        .sort((a, b) => a - b)
        .map(date => date.format(dateFormat));

    // Initialize data array
    data.data = modules.map(module => ({
        name: module,
        values: Array(dates.length).fill(0),
        username: Array(dates.length).fill([]),
    }));

    // Fill values
    arr.forEach((entry: { modules: unknown; datetime: unknown; total_active_time: string; user_list: any; }) => {
        const moduleIndex = modules.indexOf(entry.modules);
        const dateIndex = dates.indexOf(entry.datetime);
        data.data[moduleIndex].values[dateIndex] = Number(((parseInt(entry.total_active_time) / 1000 / 60)).toFixed(2));
        data.data[moduleIndex].username[dateIndex] = entry.user_list
    });

    const filtered = data.data.filter((obj: { name: null; }) => obj.name !== null)

    data.data = filtered

    return data;
}

export const GetUserActivities = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const queryData = customAppReq.query as dataToPass
        const result  = await GetUserActivitiesServices(queryData)

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

export const GetUserVisit = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const queryData = customAppReq.query as dataToPass
        const results = await GetUserVisitServices(queryData)

        res.status(200).send({
            success: true,
            status: 'success',
            statusCode: 200,
            message: 'request completed',
            data: results.data,
            page: results.page,
            perPage: results.perPage,
            total: results.total,
            orderData: results.orderData,
            orderDirection: results.orderDirection,
        })
    } catch(error){
        next(error);
    }
};

export const GetUserLastActiveGraph = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const { frequency } = customAppReq.query as dataToPass

        let results
        switch (frequency) {
            case 'daily':
                results = await GetUserLastActiveDailyServices()
                break;
            case 'weekly':
                results = await GetUserLastActiveWeeklyServices()
                break;
            case 'monthly':
                results = await GetUserLastActiveMonthlyServices()
                break;
            default:
                throw new ApiError(httpStatus.BAD_REQUEST, 'missing frequency')
        }

        const reformat:Reformat = { xAxis: [], activeUser: [], usernameData: [] }

        if (results.length > 0) {

            let xAxisArr = []
            let activeUserArr = []
            let usernameDataArr = []

            for (const item of results) {
                xAxisArr.push(item.date_text)
                activeUserArr.push(Number(item.active_user))
                usernameDataArr.push(item.list_user)
            }

            reformat.xAxis = xAxisArr
            reformat.activeUser = activeUserArr
            reformat.usernameData = usernameDataArr

        }

        res.status(200).send({
            success: true,
            status: 'success',
            statusCode: 200,
            message: 'request completed',
            data: reformat
        })
    } catch(error){
        next(error);
    }
};

export const GetUserLastActiveMiniGraph = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const { startDate, endDate } = customAppReq.query as dataToPass
        if (!req.query.startDate) throw new ApiError(httpStatus.BAD_REQUEST, 'missing startDate')
        if (!req.query.endDate) throw new ApiError(httpStatus.BAD_REQUEST, 'missing endDate')

        const [mostVisited, longestVisited, pageView] = await Promise.all([
            SelectTheMostVisitedModuleServices({ startDate, endDate }), 
            SelectTheLongestVisitedModuleServices({ startDate, endDate }), 
            SelectPageViewPerSessionServices({ startDate, endDate })
        ])

        const combinedResult = {
            mostVisited: reformatMiniGraphOverview(mostVisited,false),
            longestVisited: reformatMiniGraphOverview(longestVisited, true),
            pageView: reformatMiniGraphOverview(pageView,false)
        }


        res.status(200).send({
            success: true,
            status: 'success',
            statusCode: 200,
            message: 'request completed',
            data: combinedResult
        })

    } catch(error){
        next(error);
    }
};

export const GetUserActiveDetail = async (req: Request, res: Response, next: NextFunction) => {
    try{

        const [totalUser, newUserThisMonth] = await Promise.all([
            SelectTotalUserServices(false), 
            SelectTotalUserServices(true), 
        ])

        const combinedResult = {
            totalUser: reformatUserActiveDetail(totalUser),
            newUserThisMonth: reformatUserActiveDetail(newUserThisMonth)
        }


        res.status(200).send({
            success: true,
            status: 'success',
            statusCode: 200,
            message: 'request completed',
            data: combinedResult
        })
    } catch(error){
        next(error);
    }
};

export const AddUserActivity = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const queryData = customAppReq.body as dataToPass
        if (!queryData.lastActiveTime)
            throw new ApiError(httpStatus.BAD_REQUEST, "missing lastActiveTime");
        if (!queryData.lastIdleTime)
            throw new ApiError(httpStatus.BAD_REQUEST, "missing lastIdleTime");
        if (!queryData.username)
            throw new ApiError(httpStatus.BAD_REQUEST, "missing username");
        if (!queryData.mainscreen)
            throw new ApiError(httpStatus.BAD_REQUEST, "missing main screen");
        if (!queryData.modules)
            throw new ApiError(httpStatus.BAD_REQUEST, "missing modules");
        const { lastActiveTime, lastIdleTime, userActiveTime, username, mainscreen, modules } = queryData;

        const today = new Date();

        const result = await AddUserActivityServices({
            lastActiveTime,
            lastIdleTime,
            userActiveTime,
            mainscreen,
            modules,
            visitedby: username,
        });

        res.status(200).send({
            success: true,
            status: "success",
            statusCode: 200,
            message: "request completed",
            data: result,
        });
    } catch(error){
        next(error);
    }
};

export const GetUserActiveMiniGraphDetail = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const { startDate, endDate, moduleType } = customAppReq.query as dataToPass
        if (!req.query.moduleType) throw new ApiError(httpStatus.BAD_REQUEST, 'missing moduleType')
        if (!req.query.daterange) throw new ApiError(httpStatus.BAD_REQUEST, 'missing daterange')

        let filter = req.query
        delete filter.moduleType

        let result = []
        let otherResult = {}
        switch (moduleType) {
            case 'most-visited': {
                const mostRes = await SelectTheMostVisitedModulePagingServices(filter)
                otherResult = {
                    ...otherResult,
                    page: mostRes.page,
                    perPage: mostRes.perPage,
                    total: mostRes.total,
                    orderData: mostRes.orderData,
                    orderDirection: mostRes.orderDirection,
                }
                result = reformatMiniGraphOverview(mostRes.data,false)
                break;
            }
            case 'longest-visited': {
                const longRes = await SelectTheLongestVisitedModulePagingServices(filter)
                otherResult = {
                    ...otherResult,
                    page: longRes.page,
                    perPage: longRes.perPage,
                    total: longRes.total,
                    orderData: longRes.orderData,
                    orderDirection: longRes.orderDirection,
                }
                result = reformatMiniGraphOverview(longRes.data, true)
                break;
            }
            case 'top-session': {
                const sesRes = await SelectPageViewPerSessionPagingServices(filter)
                otherResult = {
                    ...otherResult,
                    page: sesRes.page,
                    perPage: sesRes.perPage,
                    total: sesRes.total,
                    orderData: sesRes.orderData,
                    orderDirection: sesRes.orderDirection,
                }
                result = reformatMiniGraphOverview(sesRes.data,false)
                break;
            }
            default:
                throw new ApiError(httpStatus.BAD_REQUEST, 'unidentified moduleType')
        }


        res.status(200).send({
            success: true,
            status: 'success',
            statusCode: 200,
            message: 'request completed',
            data: result,
            ...otherResult
        })
    } catch(error){
        next(error);
    }
};

export const GetVisitDurationData = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const { mainscreen, frequency, dateRange } = customAppReq.body as dataToPass
        if (!req.query.dateRange) throw new ApiError(httpStatus.BAD_REQUEST, 'missing dateRange')
        if (!req.query.mainscreen) throw new ApiError(httpStatus.BAD_REQUEST, 'missing mainscreen')
        if (!req.query.frequency) throw new ApiError(httpStatus.BAD_REQUEST, 'missing frequency')

        // let newDateRange = JSON.parse(dateRange)
        let newDateRange = dateRange

        const params = { mainscreen, frequency, startDate:moment(newDateRange.startDate).format("YYYY-MM-DD"), endDate:moment(newDateRange.endDate).format("YYYY-MM-DD") }
        const [newTableResult] = await Promise.all([GetVisitDurationDataServices(params)])

        let result = reformatOnlyForVisitDuration(newTableResult, frequency.toLowerCase(), mainscreen)

        res.status(200).send({
            success: true,
            status: 'success',
            statusCode: 200,
            message: 'request completed',
            data: result
        })
    } catch(error){
        next(error);
    }
};

export const GetExcludedUser = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const queryData = customAppReq.query as dataToPass
        const results = await GetExcludedUserServices(queryData)

        res.status(200).send({
            success: true,
            status: 'success',
            statusCode: 200,
            message: 'request completed',
            data: results.data,
            page: results.page,
            perPage: results.perPage,
            total: results.total,
            orderData: results.orderData,
            orderDirection: results.orderDirection,
        })
    } catch(error){
        next(error);
    }
};

export const GetUserActivitiesRules = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const queryData = customAppReq.query as dataToPass
        const results = await GetUserActivitiesRulesServices(queryData)

        res.status(200).send({
            success: true,
            status: 'success',
            statusCode: 200,
            message: 'request completed',
            data: results.data,
            page: results.page,
            perPage: results.perPage,
            total: results.total,
            orderData: results.orderData,
            orderDirection: results.orderDirection,
        })
    } catch(error){
        next(error);
    }
};

export const UpdateUserActivitiesRule = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const { id, condition_name, time, desc, updated_by } = customAppReq.body as dataToPass
        if (!id) throw new ApiError(httpStatus.BAD_REQUEST, 'missing id')
        if (!time) throw new ApiError(httpStatus.BAD_REQUEST, 'missing time')
        if (!desc) throw new ApiError(httpStatus.BAD_REQUEST, 'missing desc')
        let updateBy = customAppReq.user.userId

        const result = await UpdateUserActivitiesRuleServices({ id, time, desc, updateBy });

        res.status(200).send({
            success: true,
            status: "success",
            statusCode: 200,
            message: "request completed"
        });
    } catch(error){
        next(error);
    }
};

export const AddMultipleExcludeUser = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const queryData = customAppReq.body as dataToPass
        if (!queryData.listOfExcludeUSer)
            throw new ApiError(httpStatus.BAD_REQUEST, "missing listOfExcludeUSer");
        const { listOfExcludeUSer } = customAppReq.body as dataToPass;
        const userName = customAppReq.user.userId

        const today = new Date();

        const result = await AddMultipleExcludeUserServices(listOfExcludeUSer,
            userName);

        res.status(200).send({
            success: true,
            status: "success",
            statusCode: 200,
            message: "request completed"
        });
    } catch(error){
        next(error);
    }
};

export const UpdateExcludeUserStatus = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const queryData = customAppReq.body as dataToPass
        if (!queryData.userName)
            throw new ApiError(httpStatus.BAD_REQUEST, "missing userName");
        if (!queryData.status)
            throw new ApiError(httpStatus.BAD_REQUEST, "missing status");
        const { userName, status } = queryData;

        const result = await UpdateExcludeUserStatusServices(userName, status);

        res.status(200).send({
            success: true,
            status: "success",
            statusCode: 200,
            message: "request completed"
        });
    } catch(error){
        next(error);
    }
};

export const getUserPanel = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const customAppReq = req as CustomAppRequest
        const queryData = customAppReq.body as dataToPass
        const results = await getUserPanelDataServices(
            queryData.search
        );
        res.setHeader("content-type", "application/json");
        res.json(results);
    } catch(error){
        next(error);
    }
};