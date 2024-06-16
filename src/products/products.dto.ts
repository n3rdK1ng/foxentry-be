import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class ProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  price: number

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  stock: number
}

export class ProductResponseDto extends ProductDto {
  @ApiProperty()
  id: string
}
