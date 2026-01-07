import { describe, it, expect } from 'vitest';
import { calculateMilestoneStartTime } from './calculateMilestoneStartTime.js';
import type { IReleasePlanMilestone } from 'interfaces/releasePlans';

const createMilestone = (
    id: string,
    startedAt: string | null = null,
    intervalMinutes?: number,
): IReleasePlanMilestone => ({
    id,
    name: `Milestone ${id}`,
    startedAt,
    transitionCondition: intervalMinutes ? { intervalMinutes } : undefined,
    strategies: [],
    releasePlanDefinitionId: 'test-plan',
});

describe('calculateMilestoneStartTime', () => {
    const baseTime = '2024-01-01T10:00:00.000Z';
    const ONE_HOUR_IN_MINUTES = 60;
    const THIRTY_MINUTES = 30;
    const FIFTEEN_MINUTES = 15;
    const TWO_HOURS_IN_MINUTES = 120;
    const FOUR_HOURS_IN_MINUTES = 240;
    const NO_INTERVAL = 0;

    it('returns null for invalid milestone ID', () => {
        const milestones = [
            createMilestone('1', baseTime, ONE_HOUR_IN_MINUTES),
        ];
        expect(calculateMilestoneStartTime(milestones, 'invalid')).toBeNull();
    });

    it('returns null when first milestone has not started', () => {
        const milestones = [
            createMilestone('1', null, ONE_HOUR_IN_MINUTES),
            createMilestone('2', null, ONE_HOUR_IN_MINUTES),
        ];
        expect(calculateMilestoneStartTime(milestones, '2')).toBeNull();
    });

    it('calculates cascading milestone times through the chain', () => {
        const milestones = [
            createMilestone('1', baseTime, ONE_HOUR_IN_MINUTES), // +60 min = 11:00
            createMilestone('2', null, THIRTY_MINUTES), // +30 min = 11:30
            createMilestone('3', null, FIFTEEN_MINUTES), // +15 min = 11:45
        ];

        expect(calculateMilestoneStartTime(milestones, '1')).toEqual(
            new Date(baseTime),
        );
        expect(calculateMilestoneStartTime(milestones, '2')).toEqual(
            new Date('2024-01-01T11:00:00.000Z'),
        );
        expect(calculateMilestoneStartTime(milestones, '3')).toEqual(
            new Date('2024-01-01T11:30:00.000Z'),
        );
    });

    it('uses actual start time when milestone is manually started', () => {
        const milestones = [
            createMilestone('1', baseTime, ONE_HOUR_IN_MINUTES),
            createMilestone('2', '2024-01-01T12:00:00.000Z', THIRTY_MINUTES), // Manually started
            createMilestone('3', null),
        ];
        expect(calculateMilestoneStartTime(milestones, '3')).toEqual(
            new Date('2024-01-01T12:30:00.000Z'),
        );
    });

    it('returns null when milestone chain is broken', () => {
        const milestones = [
            createMilestone('1', baseTime, ONE_HOUR_IN_MINUTES),
            createMilestone('2', null), // No transition condition
            createMilestone('3', null, FIFTEEN_MINUTES),
        ];
        expect(calculateMilestoneStartTime(milestones, '3')).toBeNull();
    });

    it('handles typical release plan with manual promotion', () => {
        const milestones = [
            createMilestone(
                'alpha',
                '2024-01-01T09:00:00.000Z',
                TWO_HOURS_IN_MINUTES,
            ),
            createMilestone(
                'beta',
                '2024-01-01T10:00:00.000Z',
                FOUR_HOURS_IN_MINUTES,
            ),
            createMilestone('prod', null, NO_INTERVAL),
        ];

        expect(calculateMilestoneStartTime(milestones, 'prod')).toEqual(
            new Date('2024-01-01T14:00:00.000Z'),
        );
    });

    it('calculates from active milestone when provided', () => {
        const milestones = [
            createMilestone(
                '1',
                '2024-01-01T14:00:00.000Z',
                ONE_HOUR_IN_MINUTES,
            ),
            createMilestone('2', '2024-01-01T15:30:00.000Z', THIRTY_MINUTES),
            createMilestone('3', '2024-01-01T11:30:00.000Z', FIFTEEN_MINUTES), // Old stale start time
        ];

        // When milestone 2 is active, calculate milestone 3 from milestone 2's time
        expect(calculateMilestoneStartTime(milestones, '3', '2')).toEqual(
            new Date('2024-01-01T16:00:00.000Z'), // 15:30 + 30 min
        );
    });

    it('uses actual start time when manually progressing to next milestone', () => {
        const milestones = [
            createMilestone(
                '1',
                '2024-01-01T10:00:00.000Z',
                ONE_HOUR_IN_MINUTES,
            ),
            createMilestone('2', '2024-01-01T11:00:00.000Z', THIRTY_MINUTES), // Manually started at 11:00
            createMilestone('3', null, FIFTEEN_MINUTES),
        ];

        // Milestone 3 should calculate from milestone 2's actual start time
        expect(calculateMilestoneStartTime(milestones, '3')).toEqual(
            new Date('2024-01-01T11:30:00.000Z'), // 11:00 + 30 min
        );
    });
});
