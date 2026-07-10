import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // ─── POST /api/services ───────────────────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new service (authenticated)' })
  @ApiCreatedResponse({
    description: 'Service created successfully.',
    schema: {
      example: {
        id: 'uuid',
        title: 'Deep Tissue Massage',
        description: 'Targets deeper muscle layers.',
        duration: 60,
        price: '75.00',
        isActive: true,
        createdAt: '2026-07-10T09:00:00.000Z',
        updatedAt: '2026-07-10T09:00:00.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  // ─── GET /api/services ────────────────────────────────────────────────────

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all active services (public)' })
  @ApiOkResponse({
    description: 'Returns an array of all active services.',
    schema: {
      example: [
        {
          id: 'uuid',
          title: 'Deep Tissue Massage',
          description: 'Targets deeper muscle layers.',
          duration: 60,
          price: '75.00',
          isActive: true,
          createdAt: '2026-07-10T09:00:00.000Z',
          updatedAt: '2026-07-10T09:00:00.000Z',
        },
      ],
    },
  })
  findAll(@Query() dto: PaginationDto) {
    return this.servicesService.findAllActive(dto);
  }

  // ─── GET /api/services/:id ────────────────────────────────────────────────

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a service by ID (public)' })
  @ApiOkResponse({
    description: 'Returns the service record.',
    schema: {
      example: {
        id: 'uuid',
        title: 'Deep Tissue Massage',
        description: 'Targets deeper muscle layers.',
        duration: 60,
        price: '75.00',
        isActive: true,
        createdAt: '2026-07-10T09:00:00.000Z',
        updatedAt: '2026-07-10T09:00:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Service not found' })
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  // ─── PATCH /api/services/:id ──────────────────────────────────────────────

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a service by ID (authenticated)' })
  @ApiOkResponse({
    description: 'Service updated successfully.',
    schema: {
      example: {
        id: 'uuid',
        title: 'Updated Title',
        description: 'Updated description.',
        duration: 90,
        price: '95.00',
        isActive: true,
        createdAt: '2026-07-10T09:00:00.000Z',
        updatedAt: '2026-07-10T10:00:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Service not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  // ─── DELETE /api/services/:id ─────────────────────────────────────────────

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a service by ID (authenticated)' })
  @ApiOkResponse({
    description: 'Service deleted successfully.',
    schema: { example: { message: 'Service "uuid" deleted successfully' } },
  })
  @ApiNotFoundResponse({ description: 'Service not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
