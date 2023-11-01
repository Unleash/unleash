import { UpsertSegmentSchema } from 'lib/openapi';
import { IClientSegment, IFeatureStrategy, ISegment, IUser } from 'lib/types';

export interface ISegmentService {
    updateStrategySegments: (
        strategyId: string,
        segmentIds: number[],
    ) => Promise<void>;

    addToStrategy(id: number, strategyId: string): Promise<void>;

    getByStrategy(strategyId: string): Promise<ISegment[]>;

    get(id: number): Promise<ISegment>;

    /**
     * Gets all strategies for a segment
     * This is NOT considering the private projects
     * For most use cases, use `getVisibleStrategies`
     * @param id segment id
     */
    getStrategies(id: number): Promise<IFeatureStrategy[]>;

    getVisibleStrategies(
        id: number,
        userId: number,
    ): Promise<IFeatureStrategy[]>;

    validateName(name: string): Promise<void>;

    getActive(): Promise<ISegment[]>;

    getActiveForClient(): Promise<IClientSegment[]>;

    getAll(): Promise<ISegment[]>;

    create(
        data: UpsertSegmentSchema,
        user: Partial<Pick<IUser, 'username' | 'email'>>,
    ): Promise<ISegment>;

    update(
        id: number,
        data: UpsertSegmentSchema,
        user: Partial<Pick<IUser, 'username' | 'email'>>,
    ): Promise<void>;

    unprotectedUpdate(
        id: number,
        data: UpsertSegmentSchema,
        user: Partial<Pick<IUser, 'username' | 'email'>>,
    ): Promise<void>;

    delete(id: number, user: IUser): Promise<void>;

    unprotectedDelete(id: number, user: IUser): Promise<void>;

    removeFromStrategy(id: number, strategyId: string): Promise<void>;

    cloneStrategySegments(
        sourceStrategyId: string,
        targetStrategyId: string,
    ): Promise<void>;
}
