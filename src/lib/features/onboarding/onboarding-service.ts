import type {
    IFlagResolver,
    IProjectReadModel,
    IUnleashConfig,
    IUserStore,
} from '../../types';
import type EventEmitter from 'events';
import type { Logger } from '../../logger';
import { STAGE_ENTERED, USER_LOGIN } from '../../metric-events';
import type { NewStage } from '../feature-lifecycle/feature-lifecycle-store-type';
import type {
    InstanceEvent,
    IOnboardingStore,
    ProjectEvent,
} from './onboarding-store-type';
import { isBefore, millisecondsToSeconds } from 'date-fns';

const START_ONBOARDING_TRACKING_DATE = new Date(2024, 8, 3);

export class OnboardingService {
    private flagResolver: IFlagResolver;

    private eventBus: EventEmitter;

    private logger: Logger;

    private onboardingStore: IOnboardingStore;

    private projectReadModel: IProjectReadModel;

    private userStore: IUserStore;

    constructor(
        {
            onboardingStore,
            projectReadModel,
            userStore,
        }: {
            onboardingStore: IOnboardingStore;
            projectReadModel: IProjectReadModel;
            userStore: IUserStore;
        },
        {
            flagResolver,
            eventBus,
            getLogger,
        }: Pick<IUnleashConfig, 'flagResolver' | 'eventBus' | 'getLogger'>,
    ) {
        this.onboardingStore = onboardingStore;
        this.projectReadModel = projectReadModel;
        this.userStore = userStore;
        this.flagResolver = flagResolver;
        this.eventBus = eventBus;
        this.logger = getLogger('onboarding/onboarding-service.ts');
    }

    listen() {
        this.eventBus.on(USER_LOGIN, async (event: { loginOrder: number }) => {
            if (event.loginOrder === 0) {
                await this.insert({ type: 'first-user-login' });
            }
            if (event.loginOrder === 1) {
                await this.insert({
                    type: 'second-user-login',
                });
            }
        });
        this.eventBus.on(STAGE_ENTERED, async (stage: NewStage) => {
            if (stage.stage === 'initial') {
                await this.insert({
                    type: 'flag-created',
                    flag: stage.feature,
                });
            } else if (stage.stage === 'pre-live') {
                await this.insert({
                    type: 'pre-live',
                    flag: stage.feature,
                });
            } else if (stage.stage === 'live') {
                await this.insert({
                    type: 'live',
                    flag: stage.feature,
                });
            }
        });
    }

    async insert(
        event:
            | { flag: string; type: ProjectEvent['type'] }
            | { type: 'first-user-login' | 'second-user-login' },
    ): Promise<void> {
        const firstInstanceUserDate = await this.userStore.getFirstUserDate();
        // the time we introduced onboarding tracking
        if (
            firstInstanceUserDate &&
            isBefore(firstInstanceUserDate, START_ONBOARDING_TRACKING_DATE)
        )
            return;

        await this.insertInstanceEvent(event, firstInstanceUserDate);
        if ('flag' in event) {
            await this.insertProjectEvent(event, firstInstanceUserDate);
        }
        this.eventBus.emit('onboarding-event');
    }

    private async insertInstanceEvent(
        event: {
            flag?: string;
            type: InstanceEvent['type'];
        },
        firstInstanceUserDate: Date | null,
    ): Promise<void> {
        if (!firstInstanceUserDate) return;

        const timeToEvent = millisecondsToSeconds(
            new Date().getTime() - firstInstanceUserDate.getTime(),
        );
        await this.onboardingStore.insertInstanceEvent({
            type: event.type,
            timeToEvent,
        });
    }

    private async insertProjectEvent(
        event: {
            flag: string;
            type: ProjectEvent['type'];
        },
        firstInstanceUserDate: Date | null,
    ): Promise<void> {
        const project = await this.projectReadModel.getFeatureProject(
            event.flag,
        );
        if (!project) return;

        const startDate =
            project.project === 'default'
                ? firstInstanceUserDate
                : project.createdAt || null;

        if (!startDate) return;

        const timeToEvent = millisecondsToSeconds(
            Date.now() - startDate.getTime(),
        );
        await this.onboardingStore.insertProjectEvent({
            type: event.type,
            timeToEvent,
            project: project.project,
        });
    }
}
