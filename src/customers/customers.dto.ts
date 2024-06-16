import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CustomerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  yield: number

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  purchases: number
}
