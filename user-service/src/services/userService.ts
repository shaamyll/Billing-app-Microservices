import { Prisma, Role } from '../generated/prisma/client';
import { comparePassword, ConflictError, hashPassword, NotFoundError, ValidationError } from "@billing/utils";
import { CustomError } from "@billing/utils";
import { IUserRepository } from '../interface/userInterface';
import { jwtService } from '../config/jwt';
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
    const user = await this.userRepository.findById(id);

    if (!user) throw new NotFoundError("User not found,Please try again later");
    return user;
  }

  //Register User Service
  async register(userData: { name: string; email: string; password: string; role:Role }): Promise<void> {
    const { name, email, password, role } = userData;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) throw new ConflictError('User with this email already exists');

    if (role) {
      userData.role = role;
    }

    // Create user
   await this.userRepository.create({...userData, password: await hashPassword(password)});

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
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) throw new ConflictError('Invalid email or password');

    // Generate tokens
    const tokenPair = jwtService.generateTokenPair({
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
      const payload = jwtService.verifyAccessToken(accessToken);
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

}