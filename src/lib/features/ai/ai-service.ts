import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type { ChatCompletionRunner } from 'openai/resources/beta/chat/completions';
import OpenAI from 'openai';
import type {
    IAuthRequest,
    IUnleashConfig,
    IUnleashServices,
    Logger,
} from '../../server-impl';
import type FeatureToggleService from '../feature-toggle/feature-toggle-service';
import type { FeatureSearchService } from '../feature-search/feature-search-service';
import { createFlag } from './tools/create-flag';
import { toggleFlag } from './tools/toggle-flag';
import { searchFlag } from './tools/search-flag';

export class AIService {
    private config: IUnleashConfig;

    private logger: Logger;

    private client: OpenAI | undefined;

    private featureService: FeatureToggleService;

    private featureSearchService: FeatureSearchService;

    constructor(
        config: IUnleashConfig,
        {
            featureToggleService,
            featureSearchService,
        }: Pick<
            IUnleashServices,
            'featureToggleService' | 'featureSearchService'
        >,
    ) {
        this.config = config;
        this.logger = config.getLogger('features/ai/ai-service.ts');
        this.featureService = featureToggleService;
        this.featureSearchService = featureSearchService;
    }

    getClient(): OpenAI {
        if (this.client) {
            return this.client;
        }

        const apiKey = this.config.openAIAPIKey;
        if (!apiKey) {
            throw new Error(
                'Unleash AI is unavailable: Missing OpenAI API key',
            );
        }

        this.client = new OpenAI({ apiKey });
        return this.client;
    }

    chat(
        messages: ChatCompletionMessageParam[],
        req: IAuthRequest,
    ): ChatCompletionRunner {
        const client = this.getClient();

        return client.beta.chat.completions.runTools({
            model: 'gpt-4o-mini',
            messages,
            tools: [
                createFlag({
                    featureService: this.featureService,
                    auditUser: req.audit,
                }),
                toggleFlag({
                    featureService: this.featureService,
                    auditUser: req.audit,
                    user: req.user,
                }),
                searchFlag({
                    featureSearchService: this.featureSearchService,
                    user: req.user,
                }),
            ],
        });
    }
}
