import pool from '../config/db';
import { hashPassword } from '../utils/password';
import { decryptData } from '../utils/encryption';

interface dataToPass {
    [key: string]: any;
}

export const getServices = async (queryData: dataToPass) => {
    let page = queryData.page ? queryData.page : null
    let perPage = queryData.perPage ? queryData.perPage : null
    let orderData = queryData.orderData ? queryData.orderData : null
    let orderDirection= queryData.orderDirection ? queryData.orderDirection : null
    let filteredPagination = ['page','perPage','orderData','orderDirection']

    let data, reference, referenceContent, total=0;

    let preparedQuery = `
        SELECT 
        a.*
        FROM tb_user as a
    `;
    let strWhere: string[] = [];
    let arrParams: any[] | undefined = [];
    const keys = Object.keys(queryData)
    keys.filter(x => !filteredPagination.includes(x)).forEach((key,index) => {
        strWhere.push(`a.${key}=$${arrParams.length+1} `)
        arrParams.push(queryData[key])
    });
    if (strWhere.length) {
      preparedQuery = `${preparedQuery} WHERE ${strWhere.join(" AND ")}`;
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

export const addServices = async (name:string, email:string, password:string) => {
    try {
        const encryptedPassword = decryptData(password)
        const hashedPassword = await hashPassword(`${encryptedPassword}`)
        const result = await pool.query(
            'INSERT INTO tb_user (name, email, password) VALUES ($1, $2, $3) RETURNING *',
            [name, email, hashedPassword]
        );
        
        return { 
            result: result.rows[0],
            message: 'Success'
        }
    } catch (err) {
        throw(err)
    }
};

export const updateServices = async (id:string, name:string, email:string) => {
    try {
        const result = await pool.query(
            'UPDATE tb_user SET name=$2, email=$3 WHERE id=$1 RETURNING *',
            [id, name, email]
        );
        
        return { 
            result: result.rows[0],
            message: 'Success'
        }
    } catch (err) {
        throw(err)
    }
};

export const deleteServices = async (id:string) => {
    try {
        const result = await pool.query(
            'DELETE FROM tb_user WHERE id=$1 RETURNING *',
            [id]
        );
        
        return { 
            result: result.rows[0],
            message: 'Success'
        }
    } catch (err) {
        throw(err)
    }
};