import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function logAccountabilityAction(data: {
    action: string;
    actorId?: string;
    targetFactId?: string;
    stateChanges: any;
}) {
    // 1. Fetch the last audit log entry to get the previous hash
    const lastEntry = await prisma.auditLog.findFirst({
        orderBy: { timestamp: 'desc' },
    });

    const previousHash = lastEntry ? lastEntry.currentHash : 'GENESIS';

    // 2. Prepare data for hashing
    const timestamp = new Date().toISOString();
    const payload = JSON.stringify({
        previousHash,
        action: data.action,
        timestamp,
        actorId: data.actorId,
        targetFactId: data.targetFactId,
        stateChanges: data.stateChanges,
    });

    // 3. Compute current hash
    const currentHash = crypto.createHash('sha256').update(payload).digest('hex');

    // 4. Record in DB
    return await prisma.auditLog.create({
        data: {
            action: data.action,
            actorId: data.actorId,
            targetFactId: data.targetFactId,
            stateChanges: data.stateChanges,
            previousHash,
            currentHash,
            timestamp: new Date(timestamp),
        },
    });
}

/**
 * Verifies the integrity of the audit chain
 */
export async function verifyAuditChain() {
    const logs = await prisma.auditLog.findMany({
        orderBy: { timestamp: 'asc' },
    });

    let prevHash = 'GENESIS';
    for (const log of logs) {
        if (log.previousHash !== prevHash) {
            return { verified: false, errorAt: log.id, reason: 'Broken chain' };
        }

        const payload = JSON.stringify({
            previousHash: log.previousHash,
            action: log.action,
            timestamp: log.timestamp.toISOString(),
            actorId: log.actorId,
            targetFactId: log.targetFactId,
            stateChanges: log.stateChanges,
        });

        const computedHash = crypto.createHash('sha256').update(payload).digest('hex');
        if (computedHash !== log.currentHash) {
            return { verified: false, errorAt: log.id, reason: 'Hash mismatch' };
        }

        prevHash = log.currentHash;
    }

    return { verified: true };
}
