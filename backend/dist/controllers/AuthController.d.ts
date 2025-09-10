import { Request, Response, NextFunction } from "express";
export declare class AuthController {
    private authService;
    constructor();
    login: (req: Request, res: Response, next: NextFunction) => void;
    register: (req: Request, res: Response, next: NextFunction) => void;
    refresh: (req: Request, res: Response, next: NextFunction) => void;
    createInvite: (req: Request, res: Response, next: NextFunction) => void;
    me: (req: Request, res: Response, next: NextFunction) => void;
    logout: (req: Request, res: Response, next: NextFunction) => void;
    validateInvite: (req: Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=AuthController.d.ts.map