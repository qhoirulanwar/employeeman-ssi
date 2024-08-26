import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { FindEmployeeDto } from './dto/find-employee.dto';
import { Response } from 'express';
import { SearchDepartmentDto } from './dto/search-department.dto';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) { }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(@Body() createEmployeeDto: CreateEmployeeDto, @UploadedFile() file?: Express.Multer.File) {
    return this.employeeService.create(createEmployeeDto, file);
  }

  @Get()
  findAll(@Query() findEmployeeDto: FindEmployeeDto) {
    return this.employeeService.findAll(findEmployeeDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto, @UploadedFile() file?: Express.Multer.File) {
    return this.employeeService.update(+id, updateEmployeeDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeeService.remove(+id);
  }
  @Get('departments/search')
  async searchDepartments(@Query() searchDepartmentDto: SearchDepartmentDto) {
    const departments = await this.employeeService.findDistinctDepartments(searchDepartmentDto.search);
    return { departments };
  }

  @Get('export/csv')
  async exportToCsv(@Res() res: Response) {
    const csvData = await this.employeeService.exportToCsv();
    res.header('Content-Type', 'text/csv');
    res.attachment('employees.csv');
    return res.send(csvData);
  }

  @Post('import/csv')
  @UseInterceptors(FileInterceptor('file'))
  async importFromCsv(@UploadedFile() file: Express.Multer.File) {
    const csvContent = file.buffer.toString();
    await this.employeeService.importFromCsv(csvContent);
    return { message: 'CSV berhasil diimpor' };
  }
}