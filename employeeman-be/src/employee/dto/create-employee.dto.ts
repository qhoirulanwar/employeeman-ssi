import { IsString, IsEnum, IsDateString, IsOptional, MinLength, Matches, IsNotEmpty } from 'class-validator';
import { EmployeeStatus } from '../employee.entity';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  @MinLength(4, { message: 'Nama harus memiliki minimal 4 karakter' })
  name: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9]+$/, { message: 'Nomor karyawan hanya boleh terdiri dari huruf dan angka' })
  no: string;

  @IsString()
  @IsNotEmpty({ message: 'Posisi Jabatan tidak boleh kosong' })
  position: string;

  @IsString()
  @IsNotEmpty({ message: 'Departemen tidak boleh kosong' })
  department: string;

  @IsDateString({ strict: true, strictSeparator: true })
  @IsNotEmpty({ message: 'Tanggal bergabung tidak boleh kosong' })
  join_date: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsEnum(EmployeeStatus)
  status: EmployeeStatus;
}