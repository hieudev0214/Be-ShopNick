import { UserRole, UserStatus } from '@prisma/client';

export class UserEntity {
  id!: string;
  email?: string | null;
  phone?: string | null;
  fullName?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  zaloPhone?: string | null;
  zaloName?: string | null;
  role!: UserRole;
  status!: UserStatus;
  emailVerifiedAt?: Date | null;
  phoneVerifiedAt?: Date | null;
  lastLoginAt?: Date | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
