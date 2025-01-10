import pool from '../config/db';
import db from '../models';
import { Op } from "sequelize";
import { v4 as uuidv4 } from 'uuid';
const moment = require("moment");

interface dataToPass {
    [key: string]: any;
}

interface objectProcess {
    [key: string]: any;
}

// User Activity

export const getTransactionLogsService = async (queryData: dataToPass) => {
    try {
        let conditions:objectProcess = {}
        let filterParam:objectProcess = {}
        const searchKey = queryData.searchKey;
        if(searchKey){
            filterParam = {
                ...filterParam,
                table_name : {[Op.iLike] : `%${searchKey}%`}
            }
        }
        const startDate = queryData.daterange.startDate;
        const endDate = queryData.daterange.endDate;
        if(startDate&&endDate){
            filterParam = {
                ...filterParam,
                timestamp : {[Op.between] : [moment(startDate),moment(endDate)]}
            }
        }
        conditions = {
            ...conditions,
            where:filterParam
        }
    
        const groupby = 'transaction_id';
        let totalDataCondition:objectProcess = {}
        if(groupby){
            let groupConditions:objectProcess = {
                ...conditions,
                attributes:[
                    groupby,
                    [db.Sequelize.fn('MAX', db.sequelize.col('id')),'id'],
                ],
                group:[groupby]
            }
            totalDataCondition = {
                ...conditions,
                attributes:[
                    groupby,
                    [db.Sequelize.fn('MAX', db.sequelize.col('id')),'id'],
                ],
                group:[groupby]
            }
            let groupData = await db.TransactionLogs.findAll(groupConditions)
            let filterList = []
            for (const data of groupData) {
                filterList.push(data.dataValues.id)
            }
            conditions.where = {
                ...conditions.where,
                id : {[Op.in] : filterList}
            }
        }
    
        const limit = queryData.perPage;
        const offset = queryData.page;
        if(limit){
            conditions = {
                ...conditions,
                limit:limit
            }
            if(offset){
                conditions = {
                    ...conditions,
                    offset:limit*(offset-1)
                }
            }
        }
        const orderby = queryData.orderby;
        const orderdirection = queryData.orderdirection;
        if(orderby){
            if(orderdirection){
                conditions = {
                    ...conditions,
                    order:[[orderby,orderdirection]]
                }
            }
        } else {
            conditions = {
                ...conditions,
                order:[['id','ASC']]
            }
        }

        const result:objectProcess = await db.TransactionLogs.findAll(conditions)
        .then( async data => {
            if(data.length>0){
                for (const item of data) {
                    let allData = await db.TransactionLogs.findAll({
                        where:{
                            transaction_id : item.dataValues.transaction_id
                        }
                    })
                    
                    item.dataValues['affectedColumns']= allData
                }
            }
            let totalData = await db.TransactionLogs.findAll(totalDataCondition)
            return {
                data:data,
                total:totalData.length
            }
        })
        .catch( err => {
            throw(err)
        })

        // const result = await db.TransactionLogs.findAll({
        //     order: [
        //       ['id', 'ASC']
        //     ]
        //   });
        return result
    } catch (err) {
        throw(err)
    }
};

export const addTransactionLogsService = async (queryData: dataToPass) => {
    try {
        const result = await db.TransactionLogs.create({...queryData,transaction_id :uuidv4()})
        .then( data => {
            return data
        })
        .catch( err => {
            throw(err)
        })
        return result
    } catch (err) {
        throw(err)
    }
};

export const updateTransactionLogsService = async (queryData: dataToPass,id:number) => {
    try {
        const result = await db.TransactionLogs.update(
            queryData,
            {
                where: {id : id}
            }
        )
        .then( data => {
            return data
        })
        .catch( err => {
            throw(err)
        })
        return result
    } catch (err) {
        throw(err)
    }
};

export const getActionLogsService = async (queryData: dataToPass) => {
    try {
        let conditions:objectProcess = {}
        let filterParam:objectProcess = {}
        const searchKey = queryData.searchKey;
        if(searchKey){
            filterParam = {
                ...filterParam,
                [Op.or]: [
                    {
                        action: {[Op.like] : `%${searchKey}%`}
                    },
                    {
                        username: {[Op.like] : `%${searchKey}%`}
                    },
                    {
                        module: {[Op.like] : `%${searchKey}%`}
                    },
                    {
                        sub_module: {[Op.like] : `%${searchKey}%`}
                    },
                    {
                        description: {[Op.like] : `%${searchKey}%`}
                    }
                ]
            }
        }
        const startDate = queryData.daterange.startDate;
        const endDate = queryData.daterange.endDate;
        if(startDate&&endDate){
            filterParam = {
                ...filterParam,
                timestamp : {[Op.between] : [moment(startDate),moment(endDate)]}
            }
        }
        conditions = {
            ...conditions,
            where:filterParam
        }
    
        const limit = queryData.perPage;
        const offset = queryData.page;
        const totalDataCondition = conditions
        if(limit){
            conditions = {
                ...conditions,
                limit:limit
            }
            if(offset){
                conditions = {
                    ...conditions,
                    offset:limit*(offset-1)
                }
            }
        }
        const orderby = queryData.orderby;
        const orderdirection = queryData.orderdirection;
        if(orderby){
            if(orderdirection){
                conditions = {
                    ...conditions,
                    order:[[orderby,orderdirection]]
                }
            }
        } else {
            conditions = {
                ...conditions,
                order:[['id','ASC']]
            }
        }

        const result:objectProcess = await db.ActionLogs.findAll(conditions)
        .then( async data => {
            let totalData = await db.ActionLogs.findAll(totalDataCondition)
            return {
                data:data,
                total:totalData.length
            }
        })
        .catch( err => {
            throw(err)
        })
        
        return result
    } catch (err) {
        throw(err)
    }
};