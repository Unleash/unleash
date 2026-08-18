import { expect, test } from 'vitest';
import { gridFit } from './IntroUserGrid.tsx';

test('spacious box picks a multi-column layout with large avatars', () => {
    const fit = gridFit(20, 800, 600);
    expect(fit.cols).toBeGreaterThan(1);
    expect(fit.avatar).toBeGreaterThanOrEqual(60);
});

test('drops the meta line when tiles are too narrow to fit it', () => {
    const fit = gridFit(5, 110, 300);
    expect(fit.showMeta).toBe(false);
});

test('tall narrow box still returns a usable layout', () => {
    const fit = gridFit(10, 300, 900);
    expect(fit.cols).toBeGreaterThanOrEqual(1);
    expect(fit.avatar).toBeGreaterThanOrEqual(20);
});

test('falls back to a usable layout when the box has no size', () => {
    const fit = gridFit(20, 0, 0);
    expect(fit.cols).toBeGreaterThanOrEqual(1);
    expect(fit.avatar).toBeGreaterThanOrEqual(16);
    expect(fit.tileH).toBeGreaterThan(0);
});
