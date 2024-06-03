import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'text',
        unique: true,
    })
    email:string;

    @Column({
        type: 'text',
        select: false // evitamos que se extraiga al obtener el find
    })
    password:string;

    @Column({
        type: 'text',
    })
    fullName:string;

    @Column({
        type: 'bool',
        default: true,
    })
    isActive:boolean;

    @Column({
        type: 'text',
        array: true,
        enum: ['ADMIN', 'USER', 'DEVELOPER'],
        default: ['USER'],
    })
    roles:string[];
};
