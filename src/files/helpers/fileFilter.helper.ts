import { Request } from "express";

type callback = ( error: Error, acceptFile: boolean ) => void;



export const fileFilter = (req:Request, file: Express.Multer.File, callback: callback ) => {
    if( !file ) return callback(new Error('Missing File'), false);
    const { mimetype } = file;

    const fileExtension = mimetype.split('/').at(1);
    const validateExentsion = ['jpg', 'jpeg', 'gif', 'png'];

    if( validateExentsion.includes(fileExtension) ){
        return callback(null, true);
    };

    callback(null, false);
};
