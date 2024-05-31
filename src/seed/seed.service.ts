import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed.data';


@Injectable()
export class SeedService {

  constructor(
    private readonly productService: ProductsService,
  ){};


  async runSeed(){
    this.insertNewProducts();
    return 'Seed executed'
  };


  private async insertNewProducts(){
    await this.productService.deleteAllProducts();
    const products = initialData.products; // array
    const insertPromises = [];

    products.forEach( product => {
      insertPromises.push( this.productService.create(product) );
    });

    await Promise.all(insertPromises); // lo hacemos todo a la vez

    return true;
  };

};