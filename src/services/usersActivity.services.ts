import pool from '../config/db';
const moment = require("moment");

interface dataToPass {
    [key: string]: any;
}

// User Activity

export const GetUserActivitiesServices = async (queryData: dataToPass) => {
    let page = queryData.page ? queryData.page : null
    let perPage = queryData.perPage ? queryData.perPage : null
    let orderData = queryData.orderData ? queryData.orderData : null
    let orderDirection= queryData.orderDirection ? queryData.orderDirection : null
    let filteredPagination = ['page','perPage','orderData','orderDirection']

    let data, reference, referenceContent, total=0;

    let preparedQuery = `
        SELECT 
        a.*
        FROM public.user_time_activity a
        LEFT JOIN public.excluded_users b ON a.visited_by = b.username
        WHERE (b.is_active IS NULL OR b.is_active = false)
    `;
    let strWhere: string[] = [];
    let arrParams: any[] | undefined = [];
    const keys = Object.keys(queryData)
    keys.filter(x => !filteredPagination.includes(x)).forEach((key,index) => {
      if(key === 'searchKey'){
        strWhere.push(`(a.visited_by ILIKE $${arrParams.length+1} OR a.mainscreen ILIKE $${arrParams.length+1} OR a.modules ILIKE $${arrParams.length+1})`)
        arrParams.push(`%${queryData[key]}%`)
      } else if(key === 'daterange'){
        // let dateRangeParams = JSON.parse(queryData[key])
        let dateRangeParams = queryData[key]
        if(dateRangeParams?.startDate){
            strWhere.push(`a.last_active_time >= $${arrParams.length+1} `)
            arrParams.push(dateRangeParams?.startDate)
        }
        if(dateRangeParams?.endDate){
            strWhere.push(`a.last_active_time <= $${arrParams.length+1} `)
            arrParams.push(dateRangeParams?.endDate)
        }
      } else {
        strWhere.push(`a.${key}=$${arrParams.length+1} `)
        arrParams.push(queryData[key])
      }
    });
    if (strWhere.length) {
      preparedQuery = `${preparedQuery} AND ${strWhere.join(" AND ")}`;
    }
    let query = `${preparedQuery} ${orderData ? `ORDER BY a.${orderData} ${orderDirection}` : `ORDER BY id ASC`}`;
    let query_limited = `${query} ${perPage?`LIMIT ${perPage}`:``} ${page?`OFFSET ${(page-1)*perPage}`:``}`;
    let query_count = `
    SELECT 
    COUNT(*) as total_rows
    FROM(
        ${query}
    ) as t
    `;
    try {
        data = await pool.query(query_limited, arrParams);
        const countData = await pool.query(query_count,arrParams);
        if(countData.rows.length>0){
            total = countData.rows[0]['total_rows']
        }
        reference = true;
        referenceContent = "Success";
        return {
            data: data.rows,
            page,
            perPage,
            total,
            orderData,
            orderDirection,
            reference: reference,
            referenceContent: referenceContent,
        };
    } catch (err) {
        throw(err)
    }
};

export const GetUserVisitServices = async (queryData: dataToPass) => {
    let page = queryData.page ? queryData.page : null
    let perPage = queryData.perPage ? queryData.perPage : null
    let orderData = queryData.orderData ? queryData.orderData : null
    let orderDirection= queryData.orderDirection ? queryData.orderDirection : null
    let filteredPagination = ['page','perPage','orderData','orderDirection']

    let data, reference, referenceContent, total=0;

    let preparedQuery = `
    WITH combined_tbl AS ( 
        SELECT id, mainscreen, modules, visited_by, last_active_time
            FROM public.user_time_activity
        ),
        user_last_visit AS (
            SELECT visited_by, MAX(last_active_time) as lastvisit
            FROM combined_tbl a
            LEFT JOIN public.excluded_users b ON a.visited_by = b.username
            WHERE b.is_active IS NULL OR b.is_active = false
            GROUP BY visited_by
        )
        SELECT a.* FROM combined_tbl a
        INNER JOIN user_last_visit b ON
        a.visited_by = b.visited_by AND
        a.last_active_time = b.lastvisit
    `;
    let preparedCountQuery = `
    WITH combined_tbl AS ( 
        SELECT id, mainscreen, modules, visited_by, last_active_time
            FROM public.user_time_activity
        ),
        user_last_visit AS (
            SELECT visited_by, MAX(last_active_time) as lastvisit
            FROM combined_tbl a
            LEFT JOIN public.excluded_users b ON a.visited_by = b.username
            WHERE b.is_active IS NULL OR b.is_active = false
            GROUP BY visited_by
        )
        SELECT COUNT(a.*) as total_rows FROM combined_tbl a
        INNER JOIN user_last_visit b ON
        a.visited_by = b.visited_by AND
        a.last_active_time = b.lastvisit
    `;
    let strWhere: string[] = [];
    let arrParams: any[] | undefined = [];
    const keys = Object.keys(queryData)
    keys.filter(x => !filteredPagination.includes(x)).forEach((key,index) => {
        if(key === 'searchKey'){
          strWhere.push(`(a.visited_by ILIKE $${arrParams.length+1} OR a.mainscreen ILIKE $${arrParams.length+1} OR a.modules ILIKE $${arrParams.length+1})`)
          arrParams.push(`%${queryData[key]}%`)
        } else if(key === 'daterange'){
          let dateRangeParams = queryData[key]
          if(dateRangeParams?.startDate){
              strWhere.push(`a.last_active_time >= $${arrParams.length+1} `)
              arrParams.push(dateRangeParams?.startDate)
          }
          if(dateRangeParams?.endDate){
              strWhere.push(`a.last_active_time <= $${arrParams.length+1} `)
              arrParams.push(dateRangeParams?.endDate)
          }
        } else {
          strWhere.push(`a.${key}=$${arrParams.length+1} `)
          arrParams.push(queryData[key])
        }
    });
    if (strWhere.length) {
        preparedQuery = `${preparedQuery} WHERE ${strWhere.join(" AND ")}`;
        preparedCountQuery = `${preparedCountQuery} WHERE ${strWhere.join(" AND ")}`;
    }
    let query = `${preparedQuery} ${orderData ? `ORDER BY a.${orderData} ${orderDirection}` : `ORDER BY id ASC`}`;
    let query_limited = `${query} ${perPage?`LIMIT ${perPage}`:``} ${page?`OFFSET ${(page-1)*perPage}`:``}`;
    let query_count = `${preparedCountQuery}`;
    try {
        data = await pool.query(query_limited, arrParams);
        const countData = await pool.query(query_count,arrParams);
        if(countData.rows.length>0){
            total = countData.rows[0]['total_rows']
        }
        reference = true;
        referenceContent = "Success";
        return {
            data: data.rows,
            page,
            perPage,
            total,
            orderData,
            orderDirection,
            reference: reference,
            referenceContent: referenceContent,
        };
    } catch (err) {
        throw(err)
    }
};

export const GetUserLastActiveDailyServices = async () => {
    try {
        const queryResult = await pool.query(`
        WITH  days as (SELECT generate_series(                
            DATE_TRUNC('month', CURRENT_DATE),
            DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day', 
            INTERVAL '1 day'
            ) as dates
            ),
            summary_user_session as(
            SELECT to_char(last_active_time, 'MM-DD') as dates, visited_by, 
            COUNT(modules) as activities, SUM(user_active_time) as total_time
            FROM public.user_time_activity
            WHERE EXTRACT(YEAR FROM last_active_time ) = EXTRACT(YEAR from CURRENT_DATE)
            GROUP BY 1,2
            ), session_condition as (
            SELECT dates, visited_by, activities, total_time , ROUND(total_time/ 60000) as min
            FROM summary_user_session
            WHERE 
                total_time >= (SELECT time FROM  public.user_active_rules 
                                WHERE condition_name = 'min_module_time') * (SELECT time FROM  public.user_active_rules 
                                WHERE condition_name = 'min_modules')
            AND 
                activities >= (SELECT time FROM  public.user_active_rules 
                                WHERE condition_name = 'min_modules')
            ), combined_tbl as (
            SELECT dates, visited_by
            FROM session_condition 
            UNION
            --- SELECTING USER THAT SPENT MIN 1 HOUR IN 1 MODULE ----
            SELECT to_char(last_active_time, 'MM-DD') as dates, visited_by
            FROM public.user_time_activity
            WHERE user_active_time >= (SELECT time FROM  public.user_active_rules 
                                WHERE condition_name = 'min_time_total')
            GROUP BY dates, visited_by, user_active_time
            ),
            filtered_user as (
                SELECT dates, visited_by from combined_tbl a
                LEFT JOIN public.excluded_users c ON a.visited_by = c.username
                WHERE c.is_active IS NULL OR c.is_active = false
            )
--                 SELECT * from filtered_user a
            SELECT to_char(b.dates, 'MM-DD') datetime, to_char(b.dates, 'DD Mon') as date_text, 
            COUNT(a.visited_by) as active_user, json_agg(a.visited_by) AS list_user
            FROM filtered_user a
            RIGHT JOIN days b ON to_char(b.dates, 'MM-DD') = a.dates
            GROUP BY datetime, b.dates
            ORDER BY datetime ASC               
        `)
        return queryResult.rows
    } catch (err) {
        throw(err)
    }
};

export const GetUserLastActiveWeeklyServices = async () => {
    try {
        const queryResult = await pool.query(`
        WITH summary_user_session as(
            SELECT to_char(last_active_time, 'YYYY-MM-DD') as dates, visited_by, 
            COUNT(modules) as activities, SUM(user_active_time) as total_time
            FROM  public.user_time_activity
            WHERE EXTRACT(YEAR FROM last_active_time ) = EXTRACT(YEAR from CURRENT_DATE)
            GROUP BY 1,2
            ), 
            session_condition as (
            SELECT dates, visited_by, activities, total_time , ROUND(total_time/ 60000) as min
            FROM summary_user_session
            WHERE 
            total_time >= (SELECT time FROM  public.user_active_rules 
                            WHERE condition_name = 'min_module_time') * (SELECT time FROM  public.user_active_rules 
                            WHERE condition_name = 'min_modules')
                            AND 
                            activities >= (SELECT time FROM  public.user_active_rules 
                                           WHERE condition_name = 'min_modules')
            ), 
            combined_tbl as (
            SELECT dates, visited_by
            FROM session_condition 
            UNION
            --- SELECTING USER THAT SPENT MIN 1 HOUR IN 1 MODULE ----
            SELECT to_char(last_active_time, 'YYYY-MM-DD') as dates, visited_by
            FROM  public.user_time_activity
            WHERE user_active_time >= (SELECT time FROM  public.user_active_rules 
                                        WHERE condition_name = 'min_time_total')
            GROUP BY dates, visited_by, user_active_time
            ),
            filtered_user as (
                SELECT dates, visited_by from combined_tbl a
                LEFT JOIN  public.excluded_users c ON a.visited_by = c.username
                WHERE c.is_active IS NULL OR c.is_active = false
            ),
            weeks AS (
                SELECT generate_series(
                    DATE_TRUNC('month', CURRENT_DATE), 
                    date_trunc('month', CURRENT_DATE) + interval '1 month',  
                    interval '1 week'
                  ) AS week_start
            ),
            filtered_weeks as (
            SELECT week_start, 'week-' || ROW_NUMBER() OVER () AS week_text 
            FROM weeks
            WHERE EXTRACT(MONTH FROM week_start) = EXTRACT(MONTH FROM CURRENT_DATE)
            ),
            weekly_user as(
            SELECT * FROM filtered_weeks
            LEFT JOIN filtered_user 
            ON filtered_user.dates::timestamp >= filtered_weeks.week_start 
            AND filtered_user.dates::timestamp < filtered_weeks.week_start + interval '1 week'
            ), 
            counted_user as(
            SELECT week_start, visited_by,
            COUNT(visited_by) as visit_times
            FROM weekly_user
            GROUP BY week_start, visited_by
            ORDER BY week_start
            ),
            filtered_counted_user AS (
                SELECT week_start, COUNT(visited_by) AS total_user, json_agg(visited_by) AS list_user
                FROM counted_user 
                WHERE visit_times >= (SELECT time FROM  public.user_active_rules WHERE condition_name = 'min_weekly_days')
                GROUP BY week_start
            )
            SELECT b.week_text AS date_text, COALESCE(a.total_user, 0) AS active_user, COALESCE(a.list_user, '[]'::json) AS list_user
            FROM filtered_weeks b
            LEFT JOIN filtered_counted_user a
            ON a.week_start = b.week_start
            ORDER BY b.week_text ASC
        `)
        return queryResult.rows
    } catch (err) {
        throw(err)
    }
};

export const GetUserLastActiveMonthlyServices = async () => {
    try {
        const queryResult = await pool.query(`
        WITH months as (
            SELECT TO_CHAR(generate_series, 'FM00') AS month_number
            FROM generate_series(1, 12)
            ),
            summary_user_session as(
            SELECT to_char(last_active_time, 'MM-DD') as dates, visited_by, 
            COUNT(modules) as activities, SUM(user_active_time) as total_time
            FROM  public.user_time_activity
            WHERE EXTRACT(YEAR FROM last_active_time ) = EXTRACT(YEAR from CURRENT_DATE)
            GROUP BY 1,2
            ), session_condition as (
            SELECT dates, visited_by, activities, total_time , ROUND(total_time/ 60000) as min
            FROM summary_user_session
            WHERE 
            total_time >= (SELECT time FROM  public.user_active_rules 
            WHERE condition_name = 'min_module_time') * (SELECT time FROM  public.user_active_rules 
            WHERE condition_name = 'min_modules')
            AND 
            activities >= (SELECT time FROM  public.user_active_rules 
            WHERE condition_name = 'min_modules')
            ), 
            combined_tbl as (
            SELECT dates, visited_by
            FROM session_condition 
            UNION
            --- SELECTING USER THAT SPENT MIN 1 HOUR IN 1 MODULE ----
            SELECT to_char(last_active_time, 'MM-DD') as dates, visited_by
            FROM  public.user_time_activity
            WHERE user_active_time >= (SELECT time FROM  public.user_active_rules 
            WHERE condition_name = 'min_time_total')
            GROUP BY dates, visited_by, user_active_time
            ),
            filtered_user as (
                SELECT dates, visited_by from combined_tbl a
                LEFT JOIN public.excluded_users c ON a.visited_by = c.username
                WHERE c.is_active IS NULL OR c.is_active = false
            ),
            monthly_visitor as(
            SELECT to_char(to_date(dates, 'MM-DD'), 'MM') dates, to_char(to_date(dates, 'MM-DD'), 'Mon')as date_text, 
            visited_by, COUNT(visited_by) as total_visit 
            from filtered_user
            GROUP BY 1,2,3
            ), 
            active_user as (
            SELECT dates,  COUNT(*) as active_user, json_agg(visited_by) as list_user
            FROM monthly_visitor a               
            WHERE total_visit >= (SELECT time FROM  public.user_active_rules 
            WHERE condition_name = 'min_monthly_days')
            GROUP BY 1
            )
            SELECT b.month_number as datetime, to_char(to_date(b.month_number || EXTRACT(YEAR FROM CURRENT_DATE)::text, 'MMYYYY'), 'Mon-YYYY')  as date_text,
            COALESCE(a.active_user, 0) as active_user, COALESCE(a.list_user,'[null]'::json) as list_user
            FROM active_user a
            RIGHT JOIN months b ON a.dates = b.month_number
            ORDER BY datetime ASC
        `)
        return queryResult.rows
    } catch (err) {
        throw(err)
    }
};

export const SelectTheLongestVisitedModuleServices = async (queryData: dataToPass) => {
    try {
        let query = `with qte as (SELECT mainscreen, modules, user_active_time, visited_by
                    FROM public.user_time_activity WHERE `
        if (queryData?.startDate && queryData?.endDate) {
            query += ` last_active_time >= '${queryData?.startDate}'::date OR last_active_time <= '${queryData?.endDate}'::date`
        } else {
            query += ` last_active_time > current_date - interval '29 days' `
        }
        query += `)  
                    SELECT mainscreen, modules, SUM(user_active_time)::integer as ms,
                    ( SELECT jsonb_agg(jsonb_build_object('username', visited_by, 'time', user_active_time))
                    ) as user_list
                    FROM qte a
                    LEFT JOIN public.excluded_users b ON a.visited_by = b.username
                    WHERE  b.is_active IS NULL OR b.is_active = false 						
                    GROUP BY mainscreen, modules
                    ORDER BY ms DESC`
        const queryResult = await pool.query(query)
        return queryResult.rows
    } catch (err) {
        throw(err)
    }
};

export const SelectTheLongestVisitedModulePagingServices = async (queryData: dataToPass) => {
    let page = queryData.page ? queryData.page : null
    let perPage = queryData.perPage ? queryData.perPage : null
    let orderData = queryData.orderData ? queryData.orderData : null
    let orderDirection= queryData.orderDirection ? queryData.orderDirection : null
    let filteredPagination = ['page','perPage','orderData','orderDirection']

    let data, reference, referenceContent, total=0;

    let preparedQuery = `
        SELECT 
        a.mainscreen, 
        a.modules, 
        SUM(a.user_active_time)::integer as ms,
        ( 
            SELECT jsonb_agg(jsonb_build_object('username', a.visited_by, 'time', a.user_active_time))
        ) as user_list
        FROM public.user_time_activity a
        LEFT JOIN public.excluded_users b ON a.visited_by = b.username
        WHERE (b.is_active IS NULL OR b.is_active = false)
    `;
    let strWhere: string[] = [];
    let arrParams: any[] | undefined = [];
    const keys = Object.keys(queryData)
    keys.filter(x => !filteredPagination.includes(x)).forEach((key,index) => {
        if(key === 'searchKey'){
            strWhere.push(`a.modules ILIKE $${arrParams.length+1}`)
            arrParams.push(`%${queryData[key]}%`)
        } else if(key === 'daterange'){
            let dateRangeParams = queryData[key]
            if(dateRangeParams?.startDate){
                strWhere.push(`a.last_active_time >= $${arrParams.length+1} `)
                arrParams.push(dateRangeParams?.startDate)
            }
            if(dateRangeParams?.endDate){
                strWhere.push(`a.last_active_time <= $${arrParams.length+1} `)
                arrParams.push(dateRangeParams?.endDate)
            }
        } else {
            strWhere.push(`a.${key}=$${arrParams.length+1} `)
            arrParams.push(queryData[key])
        }
    });
    if (strWhere.length) {
      preparedQuery = `${preparedQuery} AND ${strWhere.join(" AND ")}`;
    }
    let query = `${preparedQuery} GROUP BY a.mainscreen, a.modules ${orderData ? `ORDER BY ${orderData} ${orderDirection}` : `ORDER BY ms DESC`}`;
    let query_limited = `${query} ${perPage?`LIMIT ${perPage}`:``} ${page?`OFFSET ${(page-1)*perPage}`:``}`;
    let query_count = `
    SELECT 
    COUNT(*) as total_rows
    FROM(
        ${query}
    ) as t
    `;
    try {
        data = await pool.query(query_limited, arrParams);
        const countData = await pool.query(query_count,arrParams);
        if(countData.rows.length>0){
            total = countData.rows[0]['total_rows']
        }
        reference = true;
        referenceContent = "Success";
        return {
            data: data.rows,
            page,
            perPage,
            total,
            orderData,
            orderDirection,
            reference: reference,
            referenceContent: referenceContent,
        };
    } catch (err) {
        throw(err)
    }
};

export const SelectPageViewPerSessionServices = async (queryData: dataToPass) => {
    try {
        let query = `WITH qte AS ( 
        SELECT id, mainscreen, modules, visited_by, last_active_time, user_active_time
            FROM public.user_time_activity WHERE `
        if (queryData?.startDate && queryData?.endDate) {
            query += `(last_active_time >= '${queryData?.startDate}'::date OR last_active_time <= '${queryData?.endDate}'::date)`
        } else {
            query += `last_active_time > current_date - interval '29 days'`
        }
        query += ` AND user_active_time >= (
            SELECT time from public.user_active_rules WHERE condition_name = 'min_module_time')
            )
        SELECT mainscreen, modules, COUNT(*) as total_visit, SUM(user_active_time) as ms,
        json_agg(visited_by) as user_list
        FROM qte a
        LEFT JOIN public.excluded_users b ON a.visited_by = b.username
        WHERE b.is_active IS NULL OR b.is_active = false 
        GROUP BY mainscreen, modules
        ORDER BY total_visit DESC`
        const queryResult = await pool.query(query)
        return queryResult.rows
    } catch (err) {
        throw(err)
    }
};

export const SelectPageViewPerSessionPagingServices = async (queryData: dataToPass) => {
    let page = queryData.page ? queryData.page : null
    let perPage = queryData.perPage ? queryData.perPage : null
    let orderData = queryData.orderData ? queryData.orderData : null
    let orderDirection= queryData.orderDirection ? queryData.orderDirection : null
    let filteredPagination = ['page','perPage','orderData','orderDirection']

    let data, reference, referenceContent, total=0;
    
    let preparedQuery = `
        SELECT 
            a.mainscreen,
            a.modules,
            COUNT(*) as total_visit,
            SUM(a.user_active_time) as ms,
            json_agg(a.visited_by) as user_list
        FROM public.user_time_activity a
        LEFT JOIN public.excluded_users b ON a.visited_by = b.username
        WHERE (b.is_active IS NULL OR b.is_active = false)
        AND a.user_active_time >= ( 
            SELECT time from public.user_active_rules WHERE condition_name = 'min_module_time'
        )
    `;
    let strWhere: string[] = [];
    let arrParams: any[] | undefined = [];
    const keys = Object.keys(queryData)
    keys.filter(x => !filteredPagination.includes(x)).forEach((key,index) => {
        if(key === 'searchKey'){
            strWhere.push(`a.modules ILIKE $${arrParams.length+1}`)
            arrParams.push(`%${queryData[key]}%`)
        } else if(key === 'daterange'){
            let dateRangeParams = queryData[key]
            if(dateRangeParams?.startDate){
                strWhere.push(`a.last_active_time >= $${arrParams.length+1} `)
                arrParams.push(dateRangeParams?.startDate)
            }
            if(dateRangeParams?.endDate){
                strWhere.push(`a.last_active_time <= $${arrParams.length+1} `)
                arrParams.push(dateRangeParams?.endDate)
            }
        } else {
            strWhere.push(`a.${key}=$${arrParams.length+1} `)
            arrParams.push(queryData[key])
        }
    });
    if (strWhere.length) {
      preparedQuery = `${preparedQuery} AND ${strWhere.join(" AND ")}`;
    }
    let query = `${preparedQuery} GROUP BY a.mainscreen, a.modules ${orderData ? `ORDER BY ${orderData} ${orderDirection}` : `ORDER BY ms DESC`}`;
    let query_limited = `${query} ${perPage?`LIMIT ${perPage}`:``} ${page?`OFFSET ${(page-1)*perPage}`:``}`;
    let query_count = `
    SELECT 
    COUNT(*) as total_rows
    FROM(
        ${query}
    ) as t
    `;
    try {
        data = await pool.query(query_limited, arrParams);
        const countData = await pool.query(query_count,arrParams);
        if(countData.rows.length>0){
            total = countData.rows[0]['total_rows']
        }
        reference = true;
        referenceContent = "Success";
        return {
            data: data.rows,
            page,
            perPage,
            total,
            orderData,
            orderDirection,
            reference: reference,
            referenceContent: referenceContent,
        };
    } catch (err) {
        throw(err)
    }
};

export const SelectTheMostVisitedModuleServices = async (queryData: dataToPass) => {
    try {
        let query = `
        WITH check_new_data AS (
            SELECT MIN(last_active_time) as early_data from public.user_time_activity 
            ),
        combined_tbl AS ( 
            SELECT id, mainscreen, modules, visited_by, last_active_time
                FROM public.user_time_activity `

        if (queryData?.startDate || queryData?.endDate) {
            query += `WHERE last_active_time >= '${queryData?.startDate}'::date
                            OR last_active_time <='${queryData?.endDate}'::date
                        )`
        } else {
            query += `WHERE last_active_time > current_date - interval '29 days')`
        }
        query += `
        SELECT mainscreen, modules, COUNT(*) as total_visit,
        jsonb_agg(visited_by) as user_list
        FROM combined_tbl a
        LEFT JOIN public.excluded_users b ON a.visited_by = b.username
        WHERE b.is_active IS NULL OR b.is_active = false
        GROUP BY mainscreen, modules
        ORDER BY total_visit DESC
        `
        const queryResult = await pool.query(query)

        return queryResult.rows
    } catch (err) {
        throw(err)
    }
};

export const SelectTheMostVisitedModulePagingServices = async (queryData: dataToPass) => {
    let page = queryData.page ? queryData.page : null
    let perPage = queryData.perPage ? queryData.perPage : null
    let orderData = queryData.orderData ? queryData.orderData : null
    let orderDirection= queryData.orderDirection ? queryData.orderDirection : null
    let filteredPagination = ['page','perPage','orderData','orderDirection']

    let data, reference, referenceContent, total=0;
    
    let preparedQuery = `
        SELECT mainscreen, modules, COUNT(*) as total_visit,
        jsonb_agg(visited_by) as user_list
        FROM public.user_time_activity a
        LEFT JOIN public.excluded_users b ON a.visited_by = b.username
        WHERE (b.is_active IS NULL OR b.is_active = false)
    `;
    let strWhere: string[] = [];
    let arrParams: any[] | undefined = [];
    const keys = Object.keys(queryData)
    keys.filter(x => !filteredPagination.includes(x)).forEach((key,index) => {
        if(key === 'searchKey'){
            strWhere.push(`a.modules ILIKE $${arrParams.length+1}`)
            arrParams.push(`%${queryData[key]}%`)
        } else if(key === 'daterange'){
            let dateRangeParams = queryData[key]
            if(dateRangeParams?.startDate){
                strWhere.push(`a.last_active_time >= $${arrParams.length+1} `)
                arrParams.push(dateRangeParams?.startDate)
            }
            if(dateRangeParams?.endDate){
                strWhere.push(`a.last_active_time <= $${arrParams.length+1} `)
                arrParams.push(dateRangeParams?.endDate)
            }
        } else {
            strWhere.push(`a.${key}=$${arrParams.length+1} `)
            arrParams.push(queryData[key])
        }
    });
    if (strWhere.length) {
      preparedQuery = `${preparedQuery} AND ${strWhere.join(" AND ")}`;
    }
    let query = `${preparedQuery} GROUP BY a.mainscreen, a.modules ${orderData ? `ORDER BY ${orderData} ${orderDirection}` : `ORDER BY ms DESC`}`;
    let query_limited = `${query} ${perPage?`LIMIT ${perPage}`:``} ${page?`OFFSET ${(page-1)*perPage}`:``}`;
    let query_count = `
    SELECT 
    COUNT(*) as total_rows
    FROM(
        ${query}
    ) as t
    `;
    try {
        data = await pool.query(query_limited, arrParams);
        const countData = await pool.query(query_count,arrParams);
        if(countData.rows.length>0){
            total = countData.rows[0]['total_rows']
        }
        reference = true;
        referenceContent = "Success";
        return {
            data: data.rows,
            page,
            perPage,
            total,
            orderData,
            orderDirection,
            reference: reference,
            referenceContent: referenceContent,
        };
    } catch (err) {
        throw(err)
    }
};

export const SelectTotalUserServices = async (newOnly:boolean = false) => {
    try {
        let query = `
        SELECT 
        COUNT(a.id) as total
        FROM public.tb_user a
        LEFT JOIN public.excluded_users b ON a.name = b.username
        WHERE (b.is_active IS NULL OR b.is_active = false)
        `
        let arrParams = []
        if(newOnly){
            arrParams.push(moment().startOf("month").format("YYYY-MM-DD HH:mm:ss.SSS"))
            query = `${query} AND a.create_at >= $1`
        }
        const queryResult = await pool.query(query,arrParams)

        return queryResult.rows
    } catch (err) {
        throw(err)
    }
};

export const SelectNewUserServices = async (queryData: dataToPass) => {
    try {
        let query = `
        WITH check_new_data AS (
            SELECT MIN(last_active_time) as early_data from public.user_time_activity 
            ),
        combined_tbl AS ( 
            SELECT id, mainscreen, modules, visited_by, last_active_time
                FROM public.user_time_activity `

        if (queryData?.startDate || queryData?.endDate) {
            query += `WHERE last_active_time >= '${queryData?.startDate}'::date
                            AND last_active_time <='${queryData?.endDate}'::date
                        )`
        } else {
            query += `WHERE last_active_time > current_date - interval '29 days')`
        }
        query += `
        SELECT mainscreen, modules, COUNT(*) as total_visit,
        jsonb_agg(visited_by) as user_list
        FROM combined_tbl a
        LEFT JOIN public.excluded_users b ON a.visited_by = b.username
        WHERE b.is_active IS NULL OR b.is_active = false
        GROUP BY mainscreen, modules
        ORDER BY total_visit DESC
        `
        const queryResult = await pool.query(query)

        return queryResult.rows
    } catch (err) {
        throw(err)
    }
};

export const AddUserActivityServices = async (queryData: dataToPass) => {
    let data, reference, referenceContent;
    try {
        data = await pool.query(`
            INSERT INTO public.user_time_activity(
                last_active_time, last_idle_time, visited_by, mainscreen, modules, user_active_time)
                VALUES ( $1, $2, $3, $4, $5, $6)
            `, [queryData.lastActiveTime, queryData.lastIdleTime, queryData.visitedby, queryData.mainscreen, queryData.modules, queryData.userActiveTime]);
        reference = true;
        referenceContent = "Success";
        return {
            data: data.rows,
            reference: reference,
            referenceContent: referenceContent,
        };
    } catch (err) {
        throw(err)
    }
};

export const GetVisitDurationDataServices = async (queryData: dataToPass) => {
    let values = [queryData.startDate, queryData.endDate, queryData.mainscreen]
    try {
        let sql = ``
        sql += `WITH date_range as ( SELECT to_char(GENERATE_SERIES($1 , $2 ,
        `
        switch (queryData.frequency) {
            case 'daily':
                sql += ` interval '1 day'), 'DD-MM-YYYY') as datetime ), data_table as (
                    SELECT to_char(last_active_time, 'DD-MM-YYYY') AS datetime,`
                break;
            case 'monthly':
                sql += ` interval '1 month'), 'Mon YYYY') as datetime ), data_table as (
                    SELECT to_char(last_active_time, 'Mon YYYY') AS datetime,`;
                break;
            case 'yearly':
                sql += ` interval '1 year'), 'YYYY') as datetime ), data_table as (
                    SELECT to_char(last_active_time, 'YYYY') AS datetime,`;
                break;
            default:
                throw new Error('Invalid interval');
        }

        sql += `modules, visited_by, user_active_time
        FROM public.user_time_activity
        WHERE mainscreen = $3 AND last_active_time >= $1 AND last_active_time <= $2::date + INTERVAL '1 day' `
        sql += `
        ),
        filtered_user as(
            SELECT datetime, user_active_time, modules, visited_by 
            FROM data_table a
            LEFT JOIN public.excluded_users b ON a.visited_by = b.username
            WHERE b.is_active IS NULL OR b.is_active = false
        ),
        finalized as (
            SELECT datetime, SUM(user_active_time) AS total_active_time, modules,
                (
                    SELECT jsonb_agg(jsonb_build_object('username', key, 'value', value))
                    FROM (
                            SELECT key, value::integer
                            FROM jsonb_each(
                                    (
                                    SELECT jsonb_object_agg(visited_by, total_active_time)
                                    FROM (
                                            SELECT visited_by, SUM(user_active_time)AS total_active_time
                                            FROM filtered_user b
                                            WHERE b.datetime = a.datetime AND b.modules = a.modules
                                            GROUP BY visited_by
                                    ) subquery
                                )
                            )
                        ) subquery2
                ) as user_list
                FROM filtered_user a
                GROUP BY datetime, modules
            )
        SELECT b.datetime , `
        switch (queryData.frequency) {
            case 'daily':
                sql += `to_char(to_date(b.datetime, 'DD-MM-YYYY'), 'YYYY-MM-DD') as date_number,`
                break;
            case 'monthly':
                sql += `to_char(to_date(b.datetime, 'Mon YYYY'), 'YYYY-MM') as date_number,`;
                break;
            case 'yearly':
                sql += `to_char(to_date(b.datetime, 'YYYY'), 'YYYY') as date_number,`;
                break;
            default:
                throw new Error('Invalid interval');
        }

        sql += `a.modules, total_active_time, a.user_list
        FROM finalized a
        RIGHT JOIN date_range b ON a.datetime = b.datetime
        ORDER BY date_number ASC`
        const query = await pool.query(sql, values)
        return query.rows
    } catch (err) {
        throw(err)
    }
};

export const GetExcludedUserServices = async (queryData: dataToPass) => {
    let page = queryData.page ? queryData.page : null
    let perPage = queryData.perPage ? queryData.perPage : null
    let orderData = queryData.orderData ? queryData.orderData : null
    let orderDirection= queryData.orderDirection ? queryData.orderDirection : null
    let filteredPagination = ['page','perPage','orderData','orderDirection']

    let data, reference, referenceContent, total=0;

    let preparedQuery = `
        SELECT 
        *
        FROM public.excluded_users
    `;
    let strWhere: string[] = [];
    let arrParams: any[] | undefined = [];
    const keys = Object.keys(queryData)
    keys.filter(x => !filteredPagination.includes(x)).forEach((key,index) => {
        if(key === 'searchKey'){
          if(queryData[key] != null && queryData[key] != '')
          strWhere.push(`username ILIKE $${arrParams.length+1}`)
          arrParams.push(`%${queryData[key]}%`)
        } else {
          strWhere.push(`${key}=$${arrParams.length+1} `)
          arrParams.push(queryData[key])
        }
    });
    if (strWhere.length) {
      preparedQuery = `${preparedQuery} WHERE ${strWhere.join(" AND ")}`;
    }
    let query = `${preparedQuery} ${orderData ? `ORDER BY ${orderData} ${orderDirection}` : `ORDER BY id ASC`}`;
    let query_limited = `${query} ${perPage?`LIMIT ${perPage}`:``} ${page?`OFFSET ${(page-1)*perPage}`:``}`;
    let query_count = `
    SELECT 
    COUNT(*) as total_rows
    FROM(
        ${query}
    ) as t
    `;
    try {
        data = await pool.query(query_limited, arrParams);
        const countData = await pool.query(query_count,arrParams);
        if(countData.rows.length>0){
            total = countData.rows[0]['total_rows']
        }
        reference = true;
        referenceContent = "Success";
        return {
            data: data.rows,
            page,
            perPage,
            total,
            orderData,
            orderDirection,
            reference: reference,
            referenceContent: referenceContent,
        };
    } catch (err) {
        throw(err)
    }
};

export const AddMultipleExcludeUserServices = async (users:string,userName:string) => {
    let sql = `INSERT INTO public.excluded_users (username, created_date, created_by) VALUES `
    for (let user of users) {
        sql += `('${user}', '${moment().format('YYYY-MM-DD HH:mm:ss')}', '${userName}'), `
    }
    sql = `${sql.replace(/.{2}$/, '')} ;`
    try {
        const query = await pool.query(sql)
        return query
    } catch (e) {
        throw e
    }
};

export const UpdateExcludeUserStatusServices = async (username:string,status:string) => {
    let sql = `UPDATE public.excluded_users SET is_active=${status=='active'?true:false} WHERE username='${username}'`
    try {
        const query = await pool.query(sql)
        return query
    } catch (e) {
        throw e
    }
};

export const GetUserActivitiesRulesServices = async (queryData: dataToPass) => {
    let page = queryData.page ? queryData.page : null
    let perPage = queryData.perPage ? queryData.perPage : null
    let orderData = queryData.orderData ? queryData.orderData : null
    let orderDirection= queryData.orderDirection ? queryData.orderDirection : null
    let filteredPagination = ['page','perPage','orderData','orderDirection']

    let data, reference, referenceContent, total=0;

    let preparedQuery = `
        SELECT 
        *
        FROM public.user_active_rules
    `;
    let strWhere: string[] = [];
    let arrParams: any[] | undefined = [];
    const keys = Object.keys(queryData)
    keys.filter(x => !filteredPagination.includes(x)).forEach((key,index) => {
        if(key === 'searchKey'){
          strWhere.push(`(visited_by ILIKE $${arrParams.length+1} OR mainscreen ILIKE $${arrParams.length+1} OR modules ILIKE $${arrParams.length+1})`)
          arrParams.push(`%${queryData[key]}%`)
        } else if(key === 'daterange'){
          let dateRangeParams = queryData[key]
          if(dateRangeParams?.startDate){
              strWhere.push(`last_active_time >= $${arrParams.length+1} `)
              arrParams.push(dateRangeParams?.startDate)
          }
          if(dateRangeParams?.endDate){
              strWhere.push(`last_active_time <= $${arrParams.length+1} `)
              arrParams.push(dateRangeParams?.endDate)
          }
        } else {
          strWhere.push(`${key}=$${arrParams.length+1} `)
          arrParams.push(queryData[key])
        }
    });
    if (strWhere.length) {
      preparedQuery = `${preparedQuery} WHERE ${strWhere.join(" AND ")}`;
    }
    let query = `${preparedQuery} ${orderData ? `ORDER BY ${orderData} ${orderDirection}` : `ORDER BY id ASC`}`;
    let query_limited = `${query} ${perPage?`LIMIT ${perPage}`:``} ${page?`OFFSET ${(page-1)*perPage}`:``}`;
    let query_count = `
    SELECT 
    COUNT(*) as total_rows
    FROM(
        ${query}
    ) as t
    `;
    try {
        data = await pool.query(query_limited, arrParams);
        const countData = await pool.query(query_count,arrParams);
        if(countData.rows.length>0){
            total = countData.rows[0]['total_rows']
        }
        reference = true;
        referenceContent = "Success";
        return {
            data: data.rows,
            page,
            perPage,
            total,
            orderData,
            orderDirection,
            reference: reference,
            referenceContent: referenceContent,
        };
    } catch (err) {
        throw(err)
    }
};

export const UpdateUserActivitiesRuleServices = async (queryData: dataToPass) => {
    let sql = `UPDATE public.user_active_rules
        SET  "time"=$2, "desc"=$3, updated_at=now(), "updated_by"=$4
        WHERE id=$1`
    try {
        const query = await pool.query(sql,[queryData.id, queryData.time, queryData.desc, queryData.updateBy])
        return query
    } catch (e) {
        throw e
    }
};

export const getUserPanelDataServices = async (
    search:string | null = null,
    company:string | null = null
  )=> {
    let data, reference, referenceContent;
    try {
        
        let arrParams = [];
        let strWhere = ``;
        if (search != null && search !== "") {
          if (arrParams.length === 0) strWhere += `WHERE `;
          else strWhere += ` AND `;
          strWhere += `LOWER(public.tb_user.name) LIKE $${arrParams.length + 1}`;
          arrParams.push(`%${search.toLowerCase()}%`);
        }
        // console.log('DB connect OK')
        let strQuery = `
          SELECT
          (
            select
              JSON_AGG(
                json_build_object(
                  'id',
                  public.tb_user.id,
                  'name',
                  public.tb_user.name,
                  'email',
                  public.tb_user.email,
                  'create_at',
                  public.tb_user.create_at
                )
                ORDER BY public.tb_user.id
              )
            FROM public.tb_user ${strWhere}
          ) 
          AS userData
        `;
        let query = `${strQuery}`;
        data = await (
          await pool.query(query,arrParams)
        ).rows;
  
        reference = true;
        referenceContent = "Success";
        return {
          data: data,
          reference: reference,
          referenceContent: referenceContent,
        };
    } catch (e) {
        throw e
    }
};