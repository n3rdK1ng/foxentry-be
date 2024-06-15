import { plainToInstance } from 'class-transformer'
import { IsNotEmpty, IsString, validateSync } from 'class-validator'

class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  ELASTIC_URL: string

  @IsString()
  @IsNotEmpty()
  ELASTIC_USERNAME: string

  @IsString()
  @IsNotEmpty()
  ELASTIC_PASSWORD: string
}

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvironmentVariables {}
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

export const validate = (config: Record<string, unknown>) => {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  })
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  })

  if (errors.length > 0) {
    throw new Error(errors.toString())
  }
  return validatedConfig
}
