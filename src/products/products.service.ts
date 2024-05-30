import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

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


  async findOne(id: string) {
    const Product = await this.productRepository.findOneBy({id});

    if( !Product )
      throw new BadRequestException(`product with id '${id}' not found... hehe`);

    return Product;
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