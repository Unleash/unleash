import { ISegmentPayload } from 'interfaces/segment';
import useAPI from '../useApi/useApi';

export const useSegmentsApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const createSegment = async (segment: ISegmentPayload) => {
        const req = createRequest(formatSegmentsPath(), {
            method: 'POST',
            body: JSON.stringify(segment),
        });

        return makeRequest(req.caller, req.id);
    };

    const updateSegment = async (
        segmentId: number,
        segment: ISegmentPayload
    ) => {
        const req = createRequest(formatSegmentPath(segmentId), {
            method: 'PUT',
            body: JSON.stringify(segment),
        });

        return makeRequest(req.caller, req.id);
    };

    const deleteSegment = async (segmentId: number) => {
        const req = createRequest(formatSegmentPath(segmentId), {
            method: 'DELETE',
        });
        return makeRequest(req.caller, req.id);
    };

    const setStrategySegments = async (payload: {
        projectId: string;
        environmentId: string;
        strategyId: string;
        segmentIds: number[];
    }) => {
        const req = createRequest(formatStrategiesPath(), {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        return makeRequest(req.caller, req.id);
    };

    return {
        createSegment,
        deleteSegment,
        updateSegment,
        setStrategySegments,
        errors,
        loading,
    };
};

const formatSegmentsPath = (): string => {
    return 'api/admin/segments';
};

const formatSegmentPath = (segmentId: number): string => {
    return `${formatSegmentsPath()}/${segmentId}`;
};

const formatStrategiesPath = (): string => {
    return `${formatSegmentsPath()}/strategies`;
};
