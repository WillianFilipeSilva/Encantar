import { PrismaClient } from "@prisma/client";
import { LoginData, RegisterData, AuthResponse, InviteData, JWTPayload } from "../models/Auth";
export declare class AuthService {
    private prisma;
    private jwtConfig;
    constructor(prisma: PrismaClient);
    login(loginData: LoginData): Promise<AuthResponse>;
    register(registerData: RegisterData): Promise<AuthResponse>;
    createInvite(inviteData: InviteData, enviadoPorId: string): Promise<{
        token: string;
        expiraEm: Date;
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        expiresIn: number;
    }>;
    private validateInvite;
    private generateTokens;
    private parseExpiresIn;
    verifyToken(token: string): Promise<JWTPayload>;
}
//# sourceMappingURL=AuthService.d.ts.map