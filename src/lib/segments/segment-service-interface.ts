import { UpsertSegmentSchema } from 'lib/openapi';
import { ISegment, IUser } from 'lib/types';

export interface ISegmentService {
    updateStrategySegments: (
        strategyId: string,
        segmentIds: number[],
    ) => Promise<void>;

    addToStrategy(id: number, strategyId: string): Promise<void>;

    getByStrategy(strategyId: string): Promise<ISegment[]>;

    get(id: number): Promise<ISegment>;

    getActive(): Promise<ISegment[]>;

    getAll(): Promise<ISegment[]>;

    create(
        data: UpsertSegmentSchema,
        user: Partial<Pick<IUser, 'username' | 'email'>>,
    ): Promise<ISegment>;

    delete(id: number, user: IUser): Promise<void>;

    cloneStrategySegments(
        sourceStrategyId: string,
        targetStrategyId: string,
    ): Promise<void>;
}
