import db from '../models';

export const getServices = async () => {
    try {
        const staffs = await db.Staff.findAll({
            order: [
              ['id', 'ASC']
            ]
          });
        return { 
            result: staffs,
            message: 'Success'
        }
    } catch (err) {
        if (err instanceof Error) {
            return { result: [], message: 'Database error', error: err.message }
        } else {
            return { result: [], message: 'Unknown error', error: String(err) }
        }
    }
};

export const getByPKServices = async (id:number) => {
    try {
        const staff = await db.Staff.findByPk(id);
        return { 
            result: staff,
            message: 'Success'
        }
    } catch (err) {
        if (err instanceof Error) {
            return { result: [], message: 'Database error', error: err.message }
        } else {
            return { result: [], message: 'Unknown error', error: String(err) }
        }
    }
};

export const addServices = async (
    userId:string,
    password:string,
    sector:string
) => {
    try {
        const staffCheck = await db.Staff.findAll({where: {userId : userId}})
        if(staffCheck.length==0){
            const staffs = await db.Staff.create({
                userId:userId,
                password:password,
                sector:sector,
                tripCreated:0,
                status:true
            });
            return { 
                result: staffs,
                message: 'Success'
            }
        } else {
            return { 
                result: [],
                message: `UserId (${userId}) already been used.`
            }
        }
    } catch (err) {
        if (err instanceof Error) {
            return { result: [], message: 'Database error', error: err.message }
        } else {
            return { result: [], message: 'Unknown error', error: String(err) }
        }
    }
};

export const updateServices = async (
    id:number,
    password:string,
    sector:string
) => {
    try {
        await db.Staff.update({
                password:password,
                sector:sector,
            },
            {
                where: {id : id}
            }
        );
        const staff = await db.Staff.findByPk(id);
        return { 
            result: staff,
            message: 'Success'
        }
    } catch (err) {
        if (err instanceof Error) {
            return { result: [], message: 'Database error', error: err.message }
        } else {
            return { result: [], message: 'Unknown error', error: String(err) }
        }
    }
};

export const deleteServices = async (
    id:number
) => {
    try {
        const staff = await db.Staff.findByPk(id);
        await db.Staff.destroy(
            {
                where: {id : id}
            }
        );
        return { 
            result: staff,
            message: 'Success'
        }
    } catch (err) {
        if (err instanceof Error) {
            return { result: [], message: 'Database error', error: err.message }
        } else {
            return { result: [], message: 'Unknown error', error: String(err) }
        }
    }
};