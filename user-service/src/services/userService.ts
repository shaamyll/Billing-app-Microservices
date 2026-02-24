import * as bcrypt from 'bcrypt';
import { Prisma } from '../generated/prisma/client';
import { ConflictError, JWTService, NotFoundError, ValidationError } from '../../../utils/src/index.js';
import { CustomError } from '../../../utils/src/index.js';
import { IUserRepository } from '../interface/userInterface.js';


export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
  user: Omit<Prisma.UserGetPayload<{}>, 'password'>;
}

export class UserService {
    private readonly userRepository: IUserRepository;
  constructor({ userRepository }: { userRepository: IUserRepository }) {
    this.userRepository = userRepository;
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async findById(id: string) {
    if (!id) throw new ValidationError("User id is required");
    const user = this.userRepository.findById(id);

    if (!user) throw new NotFoundError("User not found,Please try again later");
    return user;
  }

  //Register User Service
  async register(userData: UserCreateInput): Promise<UserResponseDto> {
    const { name, email, password, role } = userData;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) throw new ConflictError('User with this email already exists');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const createData: Prisma.UserCreateInput = {
      name,
      email,
      password: hashedPassword,
      isActive: true,
    };

    if (role) {
      createData.role = role;
    }

    // Create user
    const user = await this.userRepository.create(createData);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  //Login service
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Find user by email
    const user = await this.userRepository.findByEmail(email);

    if (!user) throw new ConflictError('Invalid email or password');

    // Check if user is active
    if (user.isActive === false) throw new CustomError('User account is deactivated', 401);

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) throw new ConflictError('Invalid email or password');

    // Generate tokens
    const tokenPair = JWTService.generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      ...tokenPair,
      user: userWithoutPassword,
    };
  }

  //  Get current user from token
  async getCurrentUser(accessToken: string): Promise<Omit<Prisma.UserGetPayload<{}>, 'password'> | null> {
    try {
      const payload = JWTService.verifyAccessToken(accessToken);
      const user = await this.userRepository.findById(payload.id);

      if (!user) {
        return null;
      }

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch {
      return null;
    }
  }

  //  Change user password
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) throw new NotFoundError('User not found');

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) throw new CustomError('Current password is incorrect', 401);

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.userRepository.update(userId, { password: hashedPassword });
  }

  //  Forgot password - generate reset token
  async forgotPassword(email: string): Promise<string> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) throw new NotFoundError('User not found');

    // Generate password reset token (valid for 1 hour)
    const resetToken = JWTService.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // TODO: Send email with reset token
    return resetToken;
  }


}