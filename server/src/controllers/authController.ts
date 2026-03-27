import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../prisma';
import { logAccountabilityAction } from '../utils/auditLogger';

const signupSchema = z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    idType: z.enum(['AADHAAR', 'PAN']),
    idNumber: z.string().min(5),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

/**
 * Privacy-First Signup: Identity Hashing
 */
export const signup = async (req: Request, res: Response) => {
    try {
        const validatedData = signupSchema.parse(req.body);

        // 1. Generate Identity Hash (ZKP-inspired)
        // We hash the ID type and number so we can detect duplicates without storing the raw ID
        const identityHash = crypto
            .createHash('sha256')
            .update(`${validatedData.idType}:${validatedData.idNumber}`)
            .digest('hex');

        // 2. Check for duplicate identity
        const identityExists = await prisma.user.findUnique({
            where: { identityHash },
        });

        if (identityExists) {
            return res.status(403).json({ error: 'Identity already registered on Civic Ledger.' });
        }

        // 3. Create User
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);
        const user = await prisma.user.create({
            data: {
                fullName: validatedData.fullName,
                email: validatedData.email,
                password: hashedPassword,
                identityHash: identityHash,
                reputationScore: 100, // Starting reputation
            },
        });

        // 4. Log creation in Audit Log (Immutable record of account creation)
        await logAccountabilityAction({
            action: 'ACCOUNT_CREATED',
            actorId: user.id,
            stateChanges: {
                role: 'CITIZEN',
                reputation: 100,
            },
        });

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Identity successfully inscribed on the civic ledger.',
            user: { id: user.id, email: user.email, fullName: user.fullName },
            token
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.issues });
        }
        console.error('Signup Error:', error);
        res.status(500).json({ error: 'System Error: Ledger Inscription Failed' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials access denied by protocol.' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        res.status(200).json({ user: { id: user.id, email: user.email, fullName: user.fullName, reputationScore: user.reputationScore }, token });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.issues });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
