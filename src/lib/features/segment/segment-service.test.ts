import { createTestConfig } from '../../../test/config/test-config.js';
import { TEST_AUDIT_USER } from '../../types/index.js';
import { collectIds } from '../../util/collect-ids.js';
import { createFakeSegmentService } from './createSegmentService.js';

test('adds segments in id order so opposite-order requests do not deadlock', async () => {
    const segmentService = createFakeSegmentService(createTestConfig());
    const createSegment = (name: string) =>
        segmentService.create({ name, constraints: [] }, TEST_AUDIT_USER);
    const first = await createSegment('first');
    const second = await createSegment('second');
    const third = await createSegment('third');

    await segmentService.updateStrategySegments('strategy', [
        third.id,
        first.id,
        second.id,
    ]);

    const segments = await segmentService.getByStrategy('strategy');
    expect(collectIds(segments)).toEqual([first.id, second.id, third.id]);
});
