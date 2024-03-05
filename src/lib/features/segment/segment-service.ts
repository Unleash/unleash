import { IUnleashConfig } from '../../types/option';
import {
    IFlagResolver,
    IUnleashStores,
    SKIP_CHANGE_REQUEST,
    SYSTEM_USER,
} from '../../types';
import { Logger } from '../../logger';
import NameExistsError from '../../error/name-exists-error';
import { ISegmentStore } from './segment-store-type';
import { ISegment } from '../../types/model';
import { segmentSchema } from '../../services/segment-schema';
import {
    SEGMENT_CREATED,
    SEGMENT_DELETED,
    SEGMENT_UPDATED,
} from '../../types/events';
import User from '../../types/user';
import { IFeatureStrategiesStore } from '../feature-toggle/types/feature-toggle-strategies-store-type';
import BadDataError from '../../error/bad-data-error';
import {
    ISegmentService,
    StrategiesUsingSegment,
} from './segment-service-interface';
import { PermissionError } from '../../error';
import { IChangeRequestAccessReadModel } from '../change-request-access-service/change-request-access-read-model';
import { IPrivateProjectChecker } from '../private-project/privateProjectCheckerType';
import EventService from '../events/event-service';
import { IChangeRequestSegmentUsageReadModel } from '../change-request-segment-usage-service/change-request-segment-usage-read-model';

export class SegmentService implements ISegmentService {
    private logger: Logger;

    private segmentStore: ISegmentStore;

    private featureStrategiesStore: IFeatureStrategiesStore;

    private changeRequestAccessReadModel: IChangeRequestAccessReadModel;

    private changeRequestSegmentUsageReadModel: IChangeRequestSegmentUsageReadModel;

    private config: IUnleashConfig;

    private flagResolver: IFlagResolver;

    private eventService: EventService;

    private privateProjectChecker: IPrivateProjectChecker;

    constructor(
        {
            segmentStore,
            featureStrategiesStore,
        }: Pick<IUnleashStores, 'segmentStore' | 'featureStrategiesStore'>,
        changeRequestAccessReadModel: IChangeRequestAccessReadModel,
        changeRequestSegmentUsageReadModel: IChangeRequestSegmentUsageReadModel,
        config: IUnleashConfig,
        eventService: EventService,
        privateProjectChecker: IPrivateProjectChecker,
    ) {
        this.segmentStore = segmentStore;
        this.featureStrategiesStore = featureStrategiesStore;
        this.eventService = eventService;
        this.changeRequestAccessReadModel = changeRequestAccessReadModel;
        this.changeRequestSegmentUsageReadModel =
            changeRequestSegmentUsageReadModel;
        this.privateProjectChecker = privateProjectChecker;
        this.logger = config.getLogger('services/segment-service.ts');
        this.flagResolver = config.flagResolver;
        this.config = config;
    }

    async get(id: number): Promise<ISegment> {
        return this.segmentStore.get(id);
    }

    async getAll(): Promise<ISegment[]> {
        return this.segmentStore.getAll(this.config.isEnterprise);
    }

    async getByStrategy(strategyId: string): Promise<ISegment[]> {
        return this.segmentStore.getByStrategy(strategyId);
    }

    async getVisibleStrategies(
        id: number,
        userId: number,
    ): Promise<StrategiesUsingSegment> {
        const allStrategies = await this.getAllStrategies(id);
        const accessibleProjects =
            await this.privateProjectChecker.getUserAccessibleProjects(userId);
        if (accessibleProjects.mode === 'all') {
            return allStrategies;
        } else {
            const filter = (strategy) =>
                accessibleProjects.projects.includes(strategy.projectId);
            return {
                strategies: allStrategies.strategies.filter(filter),
                changeRequestStrategies:
                    allStrategies.changeRequestStrategies.filter(filter),
            };
        }
    }

    async getAllStrategies(id: number): Promise<StrategiesUsingSegment> {
        const strategies =
            await this.featureStrategiesStore.getStrategiesBySegment(id);

        if (this.config.isEnterprise) {
            const changeRequestStrategies =
                await this.changeRequestSegmentUsageReadModel.getStrategiesUsedInActiveChangeRequests(
                    id,
                );

            return { strategies, changeRequestStrategies };
        }

        return { strategies, changeRequestStrategies: [] };
    }

    async isInUse(id: number): Promise<boolean> {
        const { strategies, changeRequestStrategies } =
            await this.getAllStrategies(id);

        return strategies.length > 0 || changeRequestStrategies.length > 0;
    }

    async create(
        data: unknown,
        user: Partial<Pick<User, 'id' | 'username' | 'email'>>,
    ): Promise<ISegment> {
        const input = await segmentSchema.validateAsync(data);
        this.validateSegmentValuesLimit(input);
        await this.validateName(input.name);
        const segment = await this.segmentStore.create(input, user);

        await this.eventService.storeEvent({
            type: SEGMENT_CREATED,
            createdBy: user.email || user.username || SYSTEM_USER.username,
            createdByUserId: user.id || SYSTEM_USER.id,
            data: segment,
            project: segment.project,
        });

        return segment;
    }

    async update(id: number, data: unknown, user: User): Promise<void> {
        const input = await segmentSchema.validateAsync(data);
        await this.stopWhenChangeRequestsEnabled(input.project, user);
        return this.unprotectedUpdate(id, data, user);
    }

    async unprotectedUpdate(
        id: number,
        data: unknown,
        user: User,
    ): Promise<void> {
        const input = await segmentSchema.validateAsync(data);
        this.validateSegmentValuesLimit(input);
        const preData = await this.segmentStore.get(id);

        if (preData.name !== input.name) {
            await this.validateName(input.name);
        }

        await this.validateSegmentProject(id, input);

        const segment = await this.segmentStore.update(id, input);

        await this.eventService.storeEvent({
            type: SEGMENT_UPDATED,
            createdBy: user.email || user.username || 'unknown',
            createdByUserId: user.id,
            data: segment,
            preData,
            project: segment.project,
        });
    }

    async delete(id: number, user: User): Promise<void> {
        const segment = await this.segmentStore.get(id);
        await this.stopWhenChangeRequestsEnabled(segment.project, user);
        await this.segmentStore.delete(id);
        await this.eventService.storeEvent({
            type: SEGMENT_DELETED,
            createdBy: user.email || user.username,
            createdByUserId: user.id,
            preData: segment,
            project: segment.project,
        });
    }

    async unprotectedDelete(id: number, user: User): Promise<void> {
        const segment = await this.segmentStore.get(id);
        await this.segmentStore.delete(id);
        await this.eventService.storeEvent({
            type: SEGMENT_DELETED,
            createdBy: user.email || user.username,
            createdByUserId: user.id,
            preData: segment,
        });
    }

    async cloneStrategySegments(
        sourceStrategyId: string,
        targetStrategyId: string,
    ): Promise<void> {
        const sourceStrategySegments =
            await this.getByStrategy(sourceStrategyId);
        await Promise.all(
            sourceStrategySegments.map((sourceStrategySegment) => {
                return this.addToStrategy(
                    sourceStrategySegment.id,
                    targetStrategyId,
                );
            }),
        );
    }

    // Used by unleash-enterprise.
    async addToStrategy(id: number, strategyId: string): Promise<void> {
        await this.validateStrategySegmentLimit(strategyId);
        await this.segmentStore.addToStrategy(id, strategyId);
    }

    async updateStrategySegments(
        strategyId: string,
        segmentIds: number[],
    ): Promise<void> {
        if (segmentIds.length > this.config.strategySegmentsLimit) {
            throw new BadDataError(
                `Strategies may not have more than ${this.config.strategySegmentsLimit} segments`,
            );
        }

        const segments = await this.getByStrategy(strategyId);
        const currentSegmentIds = segments.map((segment) => segment.id);

        const segmentIdsToRemove = currentSegmentIds.filter(
            (id) => !segmentIds.includes(id),
        );

        await Promise.all(
            segmentIdsToRemove.map((segmentId) =>
                this.removeFromStrategy(segmentId, strategyId),
            ),
        );

        const segmentIdsToAdd = segmentIds.filter(
            (id) => !currentSegmentIds.includes(id),
        );

        await Promise.all(
            segmentIdsToAdd.map((segmentId) =>
                this.addToStrategy(segmentId, strategyId),
            ),
        );
    }

    // Used by unleash-enterprise.
    async removeFromStrategy(id: number, strategyId: string): Promise<void> {
        await this.segmentStore.removeFromStrategy(id, strategyId);
    }

    async validateName(name: string): Promise<void> {
        if (!name) {
            throw new BadDataError('Segment name cannot be empty');
        }

        if (await this.segmentStore.existsByName(name)) {
            throw new NameExistsError('Segment name already exists');
        }
    }

    private async validateStrategySegmentLimit(
        strategyId: string,
    ): Promise<void> {
        const { strategySegmentsLimit } = this.config;

        if (
            (await this.getByStrategy(strategyId)).length >=
            strategySegmentsLimit
        ) {
            throw new BadDataError(
                `Strategies may not have more than ${strategySegmentsLimit} segments`,
            );
        }
    }

    private validateSegmentValuesLimit(segment: Omit<ISegment, 'id'>): void {
        const { segmentValuesLimit } = this.config;

        const valuesCount = segment.constraints
            .flatMap((constraint) => constraint.values?.length ?? 0)
            .reduce((acc, length) => acc + length, 0);

        if (valuesCount > segmentValuesLimit) {
            throw new BadDataError(
                `Segments may not have more than ${segmentValuesLimit} values`,
            );
        }
    }

    private async validateSegmentProject(
        id: number,
        segment: Omit<ISegment, 'id'>,
    ): Promise<void> {
        const { strategies, changeRequestStrategies } =
            await this.getAllStrategies(id);

        const projectsUsed = new Set(
            [strategies, changeRequestStrategies].flatMap((strats) =>
                strats.map((strategy) => strategy.projectId),
            ),
        );

        if (
            segment.project &&
            (projectsUsed.size > 1 ||
                (projectsUsed.size === 1 && !projectsUsed.has(segment.project)))
        ) {
            throw new BadDataError(
                `Invalid project. Segment is being used by strategies in other projects: ${Array.from(
                    projectsUsed,
                ).join(', ')}`,
            );
        }
    }

    private async stopWhenChangeRequestsEnabled(project?: string, user?: User) {
        if (!project) return;
        const canBypass =
            await this.changeRequestAccessReadModel.canBypassChangeRequestForProject(
                project,
                user,
            );
        if (!canBypass) {
            throw new PermissionError(SKIP_CHANGE_REQUEST);
        }
    }
}
