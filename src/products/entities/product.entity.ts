import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";


@Entity()
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
    })
    title: string;

    @Column('float', {
        default: 0,
    })
    price: number;

    @Column({
        type: 'text',
        nullable: true,
    })
    description: string;

    @Column({
        type: 'text',
        unique: true,
    })
    slug: string;

    @Column('int', {
        default: 0,
    })
    stock: number;

    @Column({
        type:'text',
        array: true,
    })
    sizes: string[];

    @Column({
        type: 'text',
    })
    gender: string;

    @Column({
        type: 'text',
        array: true,
        default: [],
    })
    tags: string[];


    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        {cascade: true, eager: true},
        // cascade sigue los cambios en las imagenes (las borra si se borra el prodicto
        // y el eager te da la opcion para obtener sus relaciones en findOne
    )
    images?: ProductImage[];


    @BeforeInsert()
    checkSlogInsert(){
        if( !this.slug ){
            this.slug = this.title;
        }

        this.slug = this.slug
        .toLowerCase()
        .replaceAll(' ','_')
        .replaceAll("'", "");
    };


    @BeforeUpdate()
    checkSlogUpdated(){
        this.slug = this.slug
        .toLowerCase()
        .replaceAll(' ','_')
        .replaceAll("'", "");
    };
}
