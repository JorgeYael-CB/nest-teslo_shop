import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUuid } from 'uuid';
import { ProductImage } from './entities';


@Injectable()
export class ProductsService {

  private readonly logger = new Logger();

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ){};


  private handleError = ( error: any ) => {
    if( error.code && +error.code === 23505 ){
      throw new BadRequestException(`Error: ${JSON.stringify(error.detail)}`);
    };

    this.logger.error(`Internal server error: ${error}`);
    throw new InternalServerErrorException('Help!');
  };


  async create(createProductDto: CreateProductDto) {

    try {
      const { images = [], ...productDetails } = createProductDto;

      /*
        Guardamos las imagenes (si es que vienen)
        Creamos la instancia de la imagen con el url de la imagen
        Hace la relacion del ID de forma automatica
      */
      const product = this.productRepository.create({
          ...productDetails,
          images: images.map( img => this.productImageRepository.create({url: img}) ),
        });

      await this.productRepository.save( product ); // lo guardamos en la DB

      return {...product, images};
    } catch (error) {
      this.handleError(error);
    }
  };


  async findAll(paginationDto: PaginationDto) {
    const {limit = 10, offset = 0} = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true, // retorna las relaciones
      },
    });

    return products.map( product => ({
      ...product,
      images: product.images.map( img => img.url ),
    }));
  };


  async findOne(term: string) {
    let product:Product;
    term = term.toUpperCase();


    if( isUuid( term ) ){
      product = await this.productRepository.findOneBy({id: term});
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod'); // prod = alias
      product = await queryBuilder
        .where(`UPPER(title) =:title or UPPER(slug) =:slug`, { // evitar inyeccion sql y mas libertad
          title: term,
          slug: term,
        })
        .leftJoinAndSelect('prod.images', 'prodImages') // extrae las imagenes del alias y le agrega un alias
        .getOne();
    };

    if( !product )
      throw new BadRequestException(`product with term '${term}' not found... hehe`);

    return product;
  };


  async findOnePlain(term: string){
    const product = await this.findOne(term);

    return {...product, images: product.images.map( img => img.url )};
  };


  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({ id, ...toUpdate });

    if( !product )
      throw new BadRequestException(`product with id: '${id}' not found`);

    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      //* Esto se hace para tener las relaciones y borrar
      //* las imagenes que no se necesitan.

      if( images ){
        //! No impacta la base de datos
        await queryRunner.manager.delete(ProductImage, { product: {id} });
        product.images = images.map( img => this.productImageRepository.create({url: img}) );
      }

      await queryRunner.manager.save( product ); // lo guardamos pero falta el commit
      await queryRunner.commitTransaction(); // hacemos el commit
      await queryRunner.release();

      return this.findOnePlain( id );
    } catch (error) {
      await queryRunner.rollbackTransaction(); // evitamos la transaccion en caso de error
      await queryRunner.release();
      this.handleError(error);
    }
  };


  async remove(id: string) {
    const product = await this.findOne(id);

    await this.productRepository.remove( product );
    return product;
  };


  async deleteAllProducts(){
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query
        .delete()
        .where({})
        .execute();

    } catch (error) {
      this.handleError(error);
    };

    return 'All products delete succes!'
  };

};