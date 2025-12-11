import { userResponseDto } from '../dto/user-response.dto';

export class UserMapper {
  static toResponse(user: any): userResponseDto {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl ?? '',
      createdAt: user.createdAt,
      role: user.role.name,
    };
  }
}
