import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive, Min } from "class-validator";


export class PaginationDto {
    @IsOptional()
    @IsInt()
    @IsPositive()
    @Min(1)
    @Type( () => Number) // segunda forma de mappear a numero
    limit?: number;


    @IsOptional()
    @IsInt()
    @Min(0)
    @Type( () => Number)
    offset?: number;
};