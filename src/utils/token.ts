import jwt from 'jsonwebtoken';

interface dataToPass {
    [key: string]: any;
}

export const generateAppToken = (userData:dataToPass) => {

    let payload:{ [key: string]: any;} = userData;
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, {
        expiresIn: "86400s",
    });
    return token
};
