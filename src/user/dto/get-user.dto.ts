import {
  IsNotEmpty,
  IsInt,
} from 'class-validator';

import { Type } from 'class-transformer';

export class GetUserDto {
  
  @IsNotEmpty({ message: 'The ID is required.' })
  @Type(() => Number)
  @IsInt({ message: 'The ID must be an integer.' })
  id: number;
}

