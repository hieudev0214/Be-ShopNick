// dto/update-game-account.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateGameAccountDto } from './create-game-account.dto';

export class UpdateGameAccountDto extends PartialType(CreateGameAccountDto) {}
