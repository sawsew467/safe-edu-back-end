import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, HttpStatus } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Organization } from './entities/organization.entity';

@Controller('organizations')
@ApiTags('organizations')
@ApiBearerAuth('token')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  async create(@Body() createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    return await this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrive all organizations' })
  async findAll() {
    return await this.organizationsService.findAll();
  }

  @Get('total')
  @ApiOperation({ summary: 'Đếm số lượng tổ chức hiện có' })
  async countAll() {
    const total = await this.organizationsService.countAllOrganizations();
    return total;
  }

  @Get('count-by-province')
async getCountByProvince() {
  return this.organizationsService.getOrganizationCountByProvince();
}


  @Get(':id')
  @ApiOperation({ summary: 'Retrive a organization by id' })
  async findOne(@Param('id') id: string): Promise<Organization> {
    return await this.organizationsService.findOneById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a organization by ID' })
  async update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto
  ): Promise<Organization> {
    return await this.organizationsService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a organization by ID' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.organizationsService.remove(id);
  }

  @Patch('isActive/:id')
  @ApiOperation({ summary: 'Update isActive true' })
  async setIsActiveTrue(@Param('id') id: string) {
    return await this.organizationsService.setIsActiveTrue(id);
  }

  @Patch('assign-manager/:id')
  @ApiOperation({ summary: 'Assign manager to organization' })
  async assignManager(
    @Param('id') organizationId: string,
    @Body('managerId') managerId: string) {
    return await this.organizationsService.assignOneManager(managerId, organizationId);
  }




}
