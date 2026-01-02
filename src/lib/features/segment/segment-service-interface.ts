import type { ChangeRequestStrategy } from '../change-request-segment-usage-service/change-request-segment-usage-read-model.js';
import type { UpsertSegmentSchema } from '../../openapi/index.js';
import type {
    IAuditUser,
    IFeatureStrategy,
    ISegment,
    IUser,
} from '../../types/index.js';

export type StrategiesUsingSegment = {
    strategies: IFeatureStrategy[];
    changeRequestStrategies: ChangeRequestStrategy[];
};

export interface ISegmentService {
    updateStrategySegments: (
        strategyId: string,
        segmentIds: number[],
    ) => Promise<void>;

    addToStrategy(id: number, strategyId: string): Promise<void>;

    getByStrategy(strategyId: string): Promise<ISegment[]>;

    get(id: number, userId?: number): Promise<ISegment>;

    /**
     * Gets all strategies for a segment
     * This is NOT considering the private projects
     * For most use cases, use `getVisibleStrategies`
     */
    getAllStrategies(id: number): Promise<StrategiesUsingSegment>;

    getVisibleStrategies(
        id: number,
        userId: number,
    ): Promise<StrategiesUsingSegment>;

    validateName(name: string): Promise<void>;

    getAll(userId?: number): Promise<ISegment[]>;

    create(data: UpsertSegmentSchema, auditUser: IAuditUser): Promise<ISegment>;

    update(
        id: number,
        data: UpsertSegmentSchema,
        user: Partial<Pick<IUser, 'username' | 'email' | 'id'>>,
        auditUser: IAuditUser,
    ): Promise<void>;

    unprotectedUpdate(
        id: number,
        data: UpsertSegmentSchema,
        auditUser: IAuditUser,
    ): Promise<void>;

    delete(id: number, user: IUser, auditUser: IAuditUser): Promise<void>;

    unprotectedDelete(id: number, auditUser: IAuditUser): Promise<void>;

    removeFromStrategy(id: number, strategyId: string): Promise<void>;

    cloneStrategySegments(
        sourceStrategyId: string,
        targetStrategyId: string,
    ): Promise<void>;

    isInUse(id: number): Promise<boolean>;
}
