import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Get, Param, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileFilter, fileNamer } from './helpers';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';



// Les comparto un enlace dónde detallan como guardar las imagenes en Cloudinary.
//? https://medium.com/codex/how-to-upload-images-to-cloudinary-using-nestjs-9f496460e8d7
// También les dejo el github del creador del post.
//? https://github.com/saulcalderon/NestJS-Cloudinary/tree/main
// Recordar que Cloudinary tiene una capa gratuita para cuentas nuevas.



@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}


  @Get('product/:imageName')
  findProductImage(
    @Param('imageName') imagName:string,
    @Res() res:Response,
  ) {

    const path = this.filesService.getStaticProductImage( imagName );
    return res.sendFile( path ); // muestra la imagen
  };


  @Post('product')
  @UseInterceptors( FileInterceptor('file', {
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer,
    })
    // limits: { fileSize: 1000 }
  }))
  uploadProductImage(
      @UploadedFile() file:Express.Multer.File,
    ) {

      if( !file ){
        throw new BadRequestException('Make sure that the file is an image');
      };

      // const secureUrl:string = `${file.filename}`;
      const secureUrl:string = `${ this.configService.get('HOST_API') }/files/product/${file.filename}`;
    return { secureUrl };
  };

}
