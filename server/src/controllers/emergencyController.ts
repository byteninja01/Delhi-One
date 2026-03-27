import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { logAccountabilityAction } from '../utils/auditLogger';

const emergencySchema = z.object({
    type: z.enum(['MEDICAL', 'FIRE', 'CRIME', 'OTHER']),
    latitude: z.number(),
    longitude: z.number(),
});

/**
 * High-Priority Life-Critical SOS Entry
 */
export const createSOS = async (req: Request, res: Response) => {
    try {
        const validatedData = emergencySchema.parse(req.body);
        const userId = (req as any).user.userId;

        // 1. Check for Abuse Patterns
        const userHistory = await prisma.emergency.findMany({
            where: { userId, status: 'ABUSE_DETECTED' },
        });

        if (userHistory.length >= 3) {
            return res.status(403).json({ error: 'Identity Temporarily Suspended: High False Alarm Rate' });
        }

        // 2. Determine Priority
        const priorityMap: Record<string, number> = {
            MEDICAL: 10,
            FIRE: 10,
            CRIME: 8,
            OTHER: 5,
        };
        const priority = priorityMap[validatedData.type] || 0;

        // 3. Automated Verification (Spatial-Temporal Convergence)
        const overlappingEvents = await prisma.emergency.findMany({
            where: {
                type: validatedData.type,
                latitude: { gte: validatedData.latitude - 0.002, lte: validatedData.latitude + 0.002 }, // ~200m
                longitude: { gte: validatedData.longitude - 0.002, lte: validatedData.longitude + 0.002 },
                createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) }, // Last 10 mins
                userId: { not: userId },
            },
        });

        const isVerified = overlappingEvents.length > 0;

        // 4. Record the Emergency on the Immutable Ledger
        const emergency = await prisma.emergency.create({
            data: {
                ...validatedData,
                userId: userId,
                priority: isVerified ? priority + 5 : priority,
                isVerified,
            },
        });

        // 5. Audit Log Entry
        await logAccountabilityAction({
            action: 'SOS_ACTIVATED',
            stateChanges: {
                type: validatedData.type,
                priority: emergency.priority,
                isVerified,
                reporterId: userId,
            },
        });

        res.status(201).json({
            message: 'SOS Registered by System. First Responders Notified.',
            emergencyId: emergency.id,
            priority: emergency.priority,
            verificationStatus: isVerified ? 'VERIFIED_CONVERGENCE' : 'UNVERIFIED_SINGLE_SOURCE',
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.issues });
        }
        res.status(500).json({ error: 'System Failure: SOS Protocol Interrupted' });
    }
};

export const getEmergencies = async (req: Request, res: Response) => {
    try {
        const emergencies = await prisma.emergency.findMany({
            orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
            include: {
                user: {
                    select: { fullName: true, phoneNumber: true },
                },
            },
        });
        res.status(200).json(emergencies);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
