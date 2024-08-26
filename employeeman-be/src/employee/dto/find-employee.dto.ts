import { IsOptional, IsInt, Min, IsString, IsEnum, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { EmployeeStatus } from '../employee.entity';
import { Logger } from '@nestjs/common';

export class FindEmployeeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value == '') {
      value = Object.values(EmployeeStatus).join(',');
    }

    if (typeof value === 'string') {
      return value.split(',').map(s => s.trim());
    }
    return value;
  })
  @IsArray()
  @IsEnum(EmployeeStatus, { each: true })
  status?: EmployeeStatus[];

  @IsOptional()
  @IsString()
  sortBy?: 'name' | 'position' | 'department' | 'status' | 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}