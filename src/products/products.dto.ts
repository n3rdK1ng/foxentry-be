import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class ProductDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsNumber()
  @IsNotEmpty()
  price: number

  @IsNumber()
  @IsNotEmpty()
  stock: number
}
