import { vi } from 'vitest';
import {
    conditionalMiddleware,
    requireFeatureEnabled,
} from './conditional-middleware.js';

test('conditionalMiddleware should run middleware when condition is true', () => {
    const middleware = vi.fn((_req, _res, next) => next());
    const next = vi.fn();

    conditionalMiddleware(() => true, middleware)({} as any, {} as any, next);

    expect(middleware).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
});

test('requireFeatureEnabled should call next when feature is enabled', () => {
    const next = vi.fn();
    const flagResolver = {
        isEnabled: vi.fn().mockReturnValue(true),
    };

    // @ts-expect-error the feature name does not exist, it's only for testing
    requireFeatureEnabled(flagResolver as any, 'changeRequestEnabled')(
        {} as any,
        {} as any,
        next,
    );

    expect(flagResolver.isEnabled).toHaveBeenCalledWith('changeRequestEnabled');
    expect(next).toHaveBeenCalledWith();
});

test('requireFeatureEnabled should return 404 when feature is disabled', () => {
    const next = vi.fn();
    const sendStatus = vi.fn();
    const flagResolver = {
        isEnabled: vi.fn().mockReturnValue(false),
    };

    // @ts-expect-error the feature name does not exist, it's only for testing
    requireFeatureEnabled(flagResolver as any, 'changeRequestEnabled')(
        {} as any,
        { sendStatus } as any,
        next,
    );

    expect(next).not.toHaveBeenCalled();
    expect(sendStatus).toHaveBeenCalledWith(404);
});
