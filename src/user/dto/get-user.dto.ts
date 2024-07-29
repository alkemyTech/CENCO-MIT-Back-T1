import {
  IsNotEmpty,
  IsInt,
} from 'class-validator';

import { Type } from 'class-transformer';

export class GetUserDto {
  
  @IsNotEmpty({ message: 'El ID es requerido.' })
  @Type(() => Number)
  @IsInt({ message: 'El ID debe ser un número entero.' })
  id: number;
}

