import { v4 as uuid } from 'uuid';
import { Request } from "express";


type callback = ( error: Error, nameFile: string ) => void;



export const fileNamer = (req:Request, file: Express.Multer.File, callback: callback ) => {
    const fileExtension = file.mimetype.split('/')[1];
    const fileName = `${uuid()}.${fileExtension}`


    callback(null, fileName);
};
