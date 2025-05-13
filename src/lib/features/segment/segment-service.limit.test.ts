import type {
    IAuditUser,
    IFlagResolver,
    IUnleashConfig,
} from '../../types/index.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import { createFakeSegmentService } from './createSegmentService.js';

const alwaysOnFlagResolver = {
    isEnabled() {
        return true;
    },
} as unknown as IFlagResolver;

test('Should not allow to exceed segment limit', async () => {
    const LIMIT = 1;
    const segmentService = createFakeSegmentService({
        getLogger,
        flagResolver: alwaysOnFlagResolver,
        resourceLimits: { segments: LIMIT },
        eventBus: {
            emit: () => {},
        },
    } as unknown as IUnleashConfig);

    const createSegment = (name: string) =>
        segmentService.create({ name, constraints: [] }, {} as IAuditUser);

    await createSegment('segmentA');

    await expect(() => createSegment('segmentB')).rejects.toThrow(
        "Failed to create segment. You can't create more than the established limit of 1.",
    );
});
