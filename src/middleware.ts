import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
 
    if (!token) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
 
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };
        req.user = { id: decoded.id }; // Ensure this matches the structure of your JWT payload
        next();
    } catch (err) {
        console.error('Token verification failed:', err);
        res.status(403).json({ error: 'Forbidden' });
    }
};
interface CustomError extends Error {
    statusCode?: number;
}

// Error-handling middleware
export const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction): void => {
    console.error(`[Error] ${err.message}`);

    const statusCode = err.statusCode || 500; // Default to 500 if statusCode is not provided
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Only include stack trace in non-production environments
    });
};
