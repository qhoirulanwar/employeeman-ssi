import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, In } from 'typeorm';
import { Employee, EmployeeStatus } from './employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { FindEmployeeDto } from './dto/find-employee.dto';
import { MediaService } from 'src/media/media.service';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private dataSource: DataSource,
    private mediaService: MediaService,
  ) { }

  async create(createEmployeeDto: CreateEmployeeDto, file?: Express.Multer.File): Promise<Employee> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const employee = this.employeeRepository.create(createEmployeeDto);
      const savedEmployee = await queryRunner.manager.save(employee);

      if (file) {
        const uploadFile = await this.mediaService.uploadFile(file, 'employee', savedEmployee.id);

        savedEmployee.photo = uploadFile.fileName;
        await queryRunner.manager.save(savedEmployee);
      }

      await queryRunner.commitTransaction();

      return savedEmployee;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(findEmployeeDto: FindEmployeeDto) {
    const { name, position, department, status, sortBy, sortOrder, page = 1, limit = 10 } = findEmployeeDto;

    const query = this.employeeRepository.createQueryBuilder('employee');

    if (name) {
      query.andWhere('employee.name LIKE :name', { name: `%${name}%` });
    }

    if (position) {
      query.andWhere('employee.position LIKE :position', { position: `%${position}%` });
    }

    if (department) {
      query.andWhere('employee.department LIKE :department', { department: `%${department}%` });
    }

    if (status && status.length > 0) {
      query.andWhere('employee.status IN (:...status)', { status });
    }

    if (sortBy && sortOrder) {
      const columnName = ["name", "position", "department"]

      if (columnName.includes(sortBy)) {
        query.orderBy(`LOWER(employee.${sortBy})`, sortOrder);
      } else {
        query.orderBy(`employee.${sortBy}`, sortOrder);
      }
    }

    const total = await query.getCount();

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    query.skip(skip).take(limitNumber);

    const employees = await query.getMany();

    return {
      data: employees,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    };
  }

  async findOne(id: number): Promise<Employee> {
    return this.employeeRepository.findOne({ where: { id } });
  }

  async update(id: number, updateEmployeeDto: Partial<CreateEmployeeDto>, file?: Express.Multer.File): Promise<Employee> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const employee = await queryRunner.manager.findOne(Employee, { where: { id } });

      if (!employee) {
        throw new Error('Employee not found');
      }

      Object.assign(employee, updateEmployeeDto);

      if (file) {
        const uploadFile = await this.mediaService.uploadFile(file, 'employee', employee.id);
        employee.photo = uploadFile.fileName;
      }

      const updatedEmployee = await queryRunner.manager.save(employee);

      await queryRunner.commitTransaction();

      return updatedEmployee;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(Employee, id);

      await queryRunner.commitTransaction();
      return { message: 'Employee deleted successfully' };

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async exportToCsv(): Promise<string> {
    const employees = await this.employeeRepository.find();
    const csvData = stringify(employees.map(employee => ({
      id: employee.id,
      nama: employee.name,
      nomor: employee.no,
      jabatan: employee.position,
      departmen: employee.department,
      tanggal_masuk: employee.join_date,
      foto: employee.photo,
      status: employee.status.toLowerCase(),
    })), { header: true });

    return csvData;
  }

  async importFromCsv(csvContent: string): Promise<void> {
    const records = parse(csvContent, { columns: true, skip_empty_lines: true });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const record of records) {
        const employee = new Employee();
        employee.name = record.nama;
        employee.no = record.nomor;
        employee.position = record.jabatan;
        employee.department = record.departmen;
        employee.join_date = new Date(record.tanggal_masuk);
        employee.photo = record.foto;
        employee.status = record.status as EmployeeStatus;

        await queryRunner.manager.save(employee);
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
  async findDistinctDepartments(search?: string): Promise<string[]> {
    const query = this.employeeRepository
      .createQueryBuilder('employee')
      .select('DISTINCT employee.department', 'department');

    if (search) {
      query.where('employee.department LIKE :search', { search: `%${search}%` });
    }

    const result = await query.getRawMany();
    return result.map(item => item.department);
  }

}