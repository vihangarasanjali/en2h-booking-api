import { PartialType } from '@nestjs/swagger';
import { CreateServiceDto } from './create-service.dto';

/**
 * UpdateServiceDto extends CreateServiceDto with all fields optional.
 * PartialType (from @nestjs/swagger) also preserves all Swagger decorators,
 * so the update endpoint is automatically documented correctly.
 */
export class UpdateServiceDto extends PartialType(CreateServiceDto) {}
