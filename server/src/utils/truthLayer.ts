import { PrismaClient } from '@prisma/client';
import { logAccountabilityAction } from './auditLogger';

const prisma = new PrismaClient();

// Configuration for Convergence
const REPUTATION_THRESHOLD = 500; // Total required reputation points to validate a fact
const RADIUS_METERS = 500; // Reports must be within this distance to converge
const MIN_REPORTS = 3; // Minimum unique reporters required

export async function processReportConvergence(newReportId: string) {
    const report = await prisma.citizenReport.findUnique({
        where: { id: newReportId },
        include: { author: true },
    });

    if (!report) return;

    // 1. Find nearby, unverified reports in the same category (conceptually)
    // For now, we'll just look for reports without a civicFactId in a rough radius
    const nearbyReports = await prisma.citizenReport.findMany({
        where: {
            civicFactId: null,
            latitude: { gte: report.latitude - 0.005, lte: report.latitude + 0.005 }, // ~500m
            longitude: { gte: report.longitude - 0.005, lte: report.longitude + 0.005 },
            createdAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }, // Last 48h
        },
        include: { author: true },
    });

    // 2. Aggregate confidence
    const totalReputation = nearbyReports.reduce((sum: number, r: any) => sum + r.author.reputationScore, 0);
    const uniqueAuthors = new Set(nearbyReports.map((r: any) => r.authorId)).size;

    if (totalReputation >= REPUTATION_THRESHOLD && uniqueAuthors >= MIN_REPORTS) {
        // 3. Promote to Civic Fact
        const fact = await prisma.civicFact.create({
            data: {
                title: `Validated Civic Issue: ${report.content.substring(0, 30)}...`,
                description: report.content,
                category: 'URBAN_INFRASTRUCTURE', // Should be dynamic
                status: 'VALIDATED',
                confidenceScore: Math.min(1.0, totalReputation / 1000),
                latitude: report.latitude,
                longitude: report.longitude,
                slaDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days SLA
                isIrreversible: true,
            },
        });

        // 4. Link reports to fact
        await prisma.citizenReport.updateMany({
            where: { id: { in: nearbyReports.map((r: any) => r.id) } },
            data: { civicFactId: fact.id },
        });

        // 5. Log as Immutable Audit Action
        await logAccountabilityAction({
            action: 'FACT_VALIDATED',
            targetFactId: fact.id,
            stateChanges: {
                status: 'VALIDATED',
                linkedReports: nearbyReports.length,
                totalReputation,
            },
        });

        return fact;
    }

    return null;
}
