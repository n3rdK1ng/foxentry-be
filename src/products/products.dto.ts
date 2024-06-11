import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class ProductDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsNumber()
  @IsNotEmpty()
  cost: number

  @IsNumber()
  @IsNotEmpty()
  stock: number
}
