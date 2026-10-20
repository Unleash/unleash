import { useMemo } from 'react';
import type { ISegment } from 'interfaces/segment';
import { useSegments } from './useSegments';

export const useSegmentsMap = (): ReadonlyMap<number, ISegment> => {
    const { segments } = useSegments();
    return useMemo(
        () => new Map(segments?.map((segment) => [segment.id, segment])),
        [segments],
    );
};
