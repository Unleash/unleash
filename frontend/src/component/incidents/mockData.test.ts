// frontend/src/component/incidents/mockData.test.ts
import { describe, it, expect } from 'vitest';
import { mockIncidents, getIncidentById, getActiveIncidents } from './mockData.ts';

describe('mockIncidents', () => {
    it('contains at least one active high-confidence and one active low-confidence incident', () => {
        const active = mockIncidents.filter((i) => i.status === 'active');
        const high = active.find((i) => i.verdict.tier === 'high');
        const moderate = active.find((i) => i.verdict.tier === 'moderate');
        expect(high).toBeDefined();
        expect(moderate).toBeDefined();
    });

    it('every active incident has at least one action', () => {
        getActiveIncidents().forEach((incident) => {
            expect(incident.actions.length).toBeGreaterThan(0);
        });
    });

    it('getIncidentById returns the right record', () => {
        const first = mockIncidents[0];
        expect(getIncidentById(first.id)).toBe(first);
        expect(getIncidentById('does-not-exist')).toBeUndefined();
    });
});
