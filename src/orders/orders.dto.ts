import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class OrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productId: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerId: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productName: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerName: string

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  price: number

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number
}
