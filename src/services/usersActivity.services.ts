import pool from '../config/db';

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
        ${preparedQuery}
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