import { FactStatus, PrismaClient } from '@prisma/client';
import { logAccountabilityAction } from './auditLogger';

const prisma = new PrismaClient();

/**
 * Sweeps the Civic Fact ledger to detect and record inaction.
 * This is the system's "Enforcement" logic.
 */
export async function enforceAccountabilitySLAs() {
    const now = new Date();

    // 1. Identify facts that have passed their SLA but aren't resolved
    const delayedFacts = await prisma.civicFact.findMany({
        where: {
            status: { notIn: [FactStatus.RESOLVED, FactStatus.DELAYED, FactStatus.ESCALATED] },
            slaDeadline: { lt: now },
        },
    });

    const processed = [];

    for (const fact of delayedFacts) {
        // 2. Escalate status
        const newStatus = fact.status === FactStatus.UNVERIFIED ? FactStatus.DELAYED : FactStatus.ESCALATED;

        await prisma.civicFact.update({
            where: { id: fact.id },
            data: {
                status: newStatus,
                escalationLevel: { increment: 1 },
            },
        });

        // 3. Record inaction as a permanent mark on the audit log
        const auditEntry = await logAccountabilityAction({
            action: 'SLA_BREACH_RECORDED',
            targetFactId: fact.id,
            stateChanges: {
                oldStatus: fact.status,
                newStatus: newStatus,
                deadline: fact.slaDeadline,
                breachTime: now,
            },
        });

        processed.push({
            factId: fact.id,
            newStatus,
            auditId: auditEntry.id,
        });
    }

    return {
        timestamp: now.toISOString(),
        affectedCount: delayedFacts.length,
        processed,
    };
}
