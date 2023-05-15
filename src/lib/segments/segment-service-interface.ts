import { UpsertSegmentSchema } from 'lib/openapi';
import { IFeatureStrategy, ISegment, IUser } from 'lib/types';

export interface ISegmentService {
    updateStrategySegments: (
        strategyId: string,
        segmentIds: number[],
    ) => Promise<void>;

    addToStrategy(id: number, strategyId: string): Promise<void>;

    getByStrategy(strategyId: string): Promise<ISegment[]>;

    get(id: number): Promise<ISegment>;

    getStrategies(id: number): Promise<IFeatureStrategy[]>;

    validateName(name: string): Promise<void>;

    getActive(): Promise<ISegment[]>;

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

    delete(id: number, user: IUser): Promise<void>;

    removeFromStrategy(id: number, strategyId: string): Promise<void>;

    cloneStrategySegments(
        sourceStrategyId: string,
        targetStrategyId: string,
    ): Promise<void>;
}
