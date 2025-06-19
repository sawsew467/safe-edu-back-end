import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { UpdateSupervisorDto } from './dto/update-supervisor.dto';
import { SupervisorRepositoryInterface } from './interfaces/supervisors.interface';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';
import { Supervisor } from './entities/supervisor.entity';
import mongoose, { FilterQuery } from 'mongoose';
import { ProvinceService } from '@modules/provinces/provinces.service';

@Injectable()
export class SupervisorsService {
	constructor(
		@Inject('SupervisorRepositoryInterface')
		private readonly supervisorRepository: SupervisorRepositoryInterface,
		private readonly provinceService: ProvinceService,
	) {}

	async create(createSupervisorDto: CreateSupervisorDto) {
		const {email, province_ids, first_name, last_name} = createSupervisorDto;
		const existed_email = await this.supervisorRepository.findOne({email});
		for (const province_id of province_ids) {
			const existed_province = await this.provinceService.findOne(province_id);
			if (!existed_province) {
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.PROVINCE_NOT_FOUND,
					details: `Province with id ${province_id} is not exist`,
				})
			}
		}
		
		if (existed_email) {
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.SUPERVISOR_EMAIL_EXIST,
				details: 'Email already exist',
			});
		}

		const supervisor = await this.supervisorRepository.create({
			...createSupervisorDto,
			province_id: province_ids.map((id) => new mongoose.Types.ObjectId(id)),
		});
		return this.supervisorRepository.findOne(supervisor);
	}

	async findAll() {
		return await this.supervisorRepository.findAll();
	}

	async findOne(_id: string) {
		return await this.supervisorRepository.findOne({_id});
	}
	async findOneByCondition(
			condition: FilterQuery<Supervisor>,
		): Promise<Supervisor | null> {
			const result = await this.supervisorRepository.findOne(condition);
			if (!result) {
				throw new NotFoundException(`Supervisor with ID ${condition} not found`);
			}
			return result;
		}

	async update(id: string,
		updateSupervisorDto: UpdateSupervisorDto
	): Promise<Supervisor> {
		const updateSupervisor = await this.supervisorRepository.update(id, {...updateSupervisorDto});
		if (!updateSupervisor) {
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.SUPERVISOR_NOT_EXIST,
				details: 'Supervisor not exist'
			})
		}
		return updateSupervisor;
	}

	async remove(id: string): Promise<Boolean> {
		return await this.supervisorRepository.remove(id);
	}

	async delete(id: string): Promise<Supervisor> {
		return await this.supervisorRepository.update(id, {
			deleted_at: new Date(),
			isActive: false
		});
	}

	async setIsActiveTrue(id: string): Promise<Supervisor> {
		return await this.supervisorRepository.update(id, {
			isActive: true
		})
	}
}
