import { IsOptional, IsString } from 'class-validator';

export class SearchDepartmentDto {
    @IsOptional()
    @IsString()
    search?: string;
}
