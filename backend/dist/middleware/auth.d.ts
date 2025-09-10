import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../models/Auth";
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const checkOwnership: (resourceIdParam?: string) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requirePermission: (permission: string) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map