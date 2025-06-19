import { Student } from '@modules/students/entities/student.entity';
import { FilterQuery } from 'mongoose';
import { FindAllResponse, QueryParams } from 'src/types/common.type';

export interface StudentsRepositoryInterface {
	findByOrgId(organizationId: string): Student[] | PromiseLike<Student[]>;
	create(data: Partial<Student>): Promise<Student>;
	findAll();
	getStudentWithRole(StudentId: string): Promise<Student | null>;
	update(id: string, data: Partial<Student>): Promise<Student | null>;
	remove(id: string): Promise<boolean>;
	findOne(condition: FilterQuery<Student>): Promise<Student | null>; 
	findOneByCondition(condition: FilterQuery<Student>): Promise<Student | null>;  
	countAllStudents();  
}
