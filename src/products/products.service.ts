import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUuid } from 'uuid';


@Injectable()
export class ProductsService {

  private readonly logger = new Logger();

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
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

      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save( product ); // lo guardamos en la DB

      return product;
    } catch (error) {
      this.handleError(error);
    }
  };


  async findAll(paginationDto: PaginationDto) {
    const {limit = 10, offset = 0} = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,

      // TODO: relaciones
    });
    return products;
  };


  async findOne(term: string) {
    let product:Product;
    term = term.toUpperCase();


    if( isUuid( term ) ){
      product = await this.productRepository.findOneBy({id: term});
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where(`UPPER(title) =:title or UPPER(slug) =:slug`, { // evitar inyeccion sql y mas libertad
          title: term,
          slug: term,
        }).getOne();
    };

    if( !product )
      throw new BadRequestException(`product with term '${term}' not found... hehe`);

    return product;
  };


  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  };

  async remove(id: string) {
    const product = await this.productRepository.findOneBy({id});

    if( !product )
      throw new BadRequestException(`Product with id '${id}' not found`);

    this.productRepository.remove( product );

    return product
  };
};