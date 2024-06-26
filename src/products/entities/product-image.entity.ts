import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";


@Entity({name: 'products-images'})
export class ProductImage {

    @PrimaryGeneratedColumn()
    id:number;

    @Column({
        type: 'text',
    })
    url: string;

    @ManyToOne(
        () => Product,
        ( product ) => product.images,
        { onDelete: 'CASCADE' } // elimina todo lo referente
    )
    product: Product;
};
