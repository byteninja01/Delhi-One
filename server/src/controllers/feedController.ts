import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { processReportConvergence } from '../utils/truthLayer';

const reportSchema = z.object({
    content: z.string().min(10, "Report must be descriptive enough for verification"),
    mediaUrls: z.array(z.string()).optional(),
    latitude: z.number(),
    longitude: z.number(),
});

/**
 * Returns the Verifiable Truth Layer: All Civic Facts
 */
export const getFeed = async (req: Request, res: Response) => {
    try {
        const facts = await prisma.civicFact.findMany({
            orderBy: { updatedAt: 'desc' },
            include: {
                reports: {
                    select: { id: true, createdAt: true },
                },
            },
        });
        res.status(200).json(facts);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Submits a Citizen Report to the Truth Layer for Convergence processing
 */
export const createPost = async (req: Request, res: Response) => {
    try {
        const validatedData = reportSchema.parse(req.body);
        const userId = (req as any).user.userId;

        // 1. Record the raw allegation
        const report = await prisma.citizenReport.create({
            data: {
                content: validatedData.content,
                mediaUrls: validatedData.mediaUrls || [],
                latitude: validatedData.latitude,
                longitude: validatedData.longitude,
                authorId: userId,
            },
        });

        // 2. Trigger the Truth Convergence Engine (Background-ish)
        // We await it here for immediate feedback in this proto, but could be async
        const fact = await processReportConvergence(report.id);

        res.status(201).json({
            message: 'Report recorded on the immutable ledger.',
            reportId: report.id,
            factDiscovered: fact ? true : false,
            factId: fact?.id || null,
            status: fact ? 'VALIDATED' : 'PROBATION',
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.issues });
        }
        console.error('Report Creation Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
