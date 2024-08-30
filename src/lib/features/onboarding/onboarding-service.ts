import type { IFlagResolver, IUnleashConfig } from '../../types';
import type EventEmitter from 'events';
import type { Logger } from '../../logger';
import { STAGE_ENTERED, USER_LOGIN } from '../../metric-events';
import type { NewStage } from '../feature-lifecycle/feature-lifecycle-store-type';
import type { IOnboardingStore } from './onboarding-store-type';

export class OnboardingService {
    private flagResolver: IFlagResolver;

    private eventBus: EventEmitter;

    private logger: Logger;

    private onboardingStore: IOnboardingStore;

    constructor(
        { onboardingStore }: { onboardingStore: IOnboardingStore },
        {
            flagResolver,
            eventBus,
            getLogger,
        }: Pick<IUnleashConfig, 'flagResolver' | 'eventBus' | 'getLogger'>,
    ) {
        this.onboardingStore = onboardingStore;
        this.flagResolver = flagResolver;
        this.eventBus = eventBus;
        this.logger = getLogger('onboarding/onboarding-service.ts');
    }

    listen() {
        this.eventBus.on(USER_LOGIN, async (event: { loginOrder: number }) => {
            if (!this.flagResolver.isEnabled('onboardingMetrics')) return;

            if (event.loginOrder === 0) {
                await this.onboardingStore.insert({ type: 'first-user-login' });
            }
            if (event.loginOrder === 1) {
                await this.onboardingStore.insert({
                    type: 'second-user-login',
                });
            }
        });
        this.eventBus.on(STAGE_ENTERED, async (stage: NewStage) => {
            if (!this.flagResolver.isEnabled('onboardingMetrics')) return;

            if (stage.stage === 'initial') {
                await this.onboardingStore.insert({
                    type: 'flag-created',
                    flag: stage.feature,
                });
            } else if (stage.stage === 'pre-live') {
                await this.onboardingStore.insert({
                    type: 'pre-live',
                    flag: stage.feature,
                });
            } else if (stage.stage === 'live') {
                await this.onboardingStore.insert({
                    type: 'live',
                    flag: stage.feature,
                });
            }
        });
    }
}
