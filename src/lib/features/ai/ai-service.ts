import type {
    ChatCompletion,
    ChatCompletionMessageParam,
} from 'openai/resources/chat/completions';
import type {
    ChatCompletionRunner,
    ChatCompletionStream,
} from 'openai/resources/beta/chat/completions';
import OpenAI from 'openai';
import type {
    IUnleashConfig,
    IUnleashServices,
    Logger,
} from '../../server-impl';
import type { APIPromise } from 'openai/core';
import { ADMIN_TOKEN_USER, SYSTEM_USER, SYSTEM_USER_AUDIT } from '../../types';
import type FeatureToggleService from '../feature-toggle/feature-toggle-service';

export class AIService {
    private config: IUnleashConfig;

    private logger: Logger;

    private client: OpenAI | undefined;

    private featureService: FeatureToggleService;

    constructor(
        config: IUnleashConfig,
        {
            featureToggleService,
        }: Pick<IUnleashServices, 'featureToggleService'>,
    ) {
        this.config = config;
        this.logger = config.getLogger('features/ai/ai-service.ts');
        this.featureService = featureToggleService;
    }

    getClient(): OpenAI {
        if (this.client) {
            return this.client;
        }

        const apiKey = this.config.openAIAPIKey;
        if (!apiKey) {
            throw new Error('Missing OpenAI API key');
        }

        this.client = new OpenAI({ apiKey });
        return this.client;
    }

    createChatCompletion(
        messages: ChatCompletionMessageParam[],
    ): APIPromise<ChatCompletion> {
        const client = this.getClient();

        return client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages,
        });
    }

    createFlag = async ({
        project,
        flag,
        description,
    }: {
        project: string;
        flag: string;
        description?: string;
    }) => {
        try {
            const flagData = await this.featureService.createFeatureToggle(
                project,
                { name: flag, description },
                SYSTEM_USER_AUDIT,
            );

            return flagData;
        } catch (error) {
            return error;
        }
    };

    getFlag = async ({
        project,
        flag,
    }: {
        project: string;
        flag: string;
    }) => {
        try {
            const flagData = await this.featureService.getFeature({
                featureName: flag,
                archived: false,
                projectId: project,
                environmentVariants: false,
                userId: SYSTEM_USER.id,
            });

            return flagData;
        } catch (error) {
            return error;
        }
    };

    toggleFlag = async ({
        project,
        flag,
        environment,
        enabled,
    }: {
        project: string;
        flag: string;
        environment: string;
        enabled: boolean;
    }) => {
        try {
            const data = await this.featureService.updateEnabled(
                project,
                flag,
                environment,
                enabled,
                SYSTEM_USER_AUDIT,
                ADMIN_TOKEN_USER,
                false,
            );

            return data;
        } catch (error) {
            return error;
        }
    };

    archiveFlag = async ({
        project,
        flag,
    }: {
        project: string;
        flag: string;
    }) => {
        try {
            const flagData = await this.featureService.archiveToggle(
                flag,
                ADMIN_TOKEN_USER,
                SYSTEM_USER_AUDIT,
                project,
            );

            return flagData;
        } catch (error) {
            return error;
        }
    };

    createChatCompletionWithTools(
        messages: ChatCompletionMessageParam[],
    ): ChatCompletionRunner {
        const client = this.getClient();

        return client.beta.chat.completions.runTools({
            model: 'gpt-4o-mini',
            messages,
            tools: [
                {
                    type: 'function',
                    function: {
                        function: this.createFlag,
                        name: 'createFlag',
                        description:
                            'Create a feature flag by name and project. Optionally supply a description',
                        parse: JSON.parse,
                        parameters: {
                            type: 'object',
                            properties: {
                                project: { type: 'string' },
                                flag: { type: 'string' },
                                description: { type: 'string' },
                            },
                            required: ['project', 'flag'],
                        },
                    },
                },
                {
                    type: 'function',
                    function: {
                        function: this.getFlag,
                        name: 'getFlag',
                        description: 'Get a feature flag by name and project',
                        parse: JSON.parse,
                        parameters: {
                            type: 'object',
                            properties: {
                                project: { type: 'string' },
                                flag: { type: 'string' },
                            },
                            required: ['project', 'flag'],
                        },
                    },
                },
                {
                    type: 'function',
                    function: {
                        function: this.toggleFlag,
                        name: 'toggleFlag',
                        description:
                            'Toggle a feature flag by name, project, environment, and enabled status',
                        parse: JSON.parse,
                        parameters: {
                            type: 'object',
                            properties: {
                                project: { type: 'string' },
                                flag: { type: 'string' },
                                environment: { type: 'string' },
                                enabled: { type: 'boolean' },
                            },
                            required: [
                                'project',
                                'flag',
                                'environment',
                                'enabled',
                            ],
                        },
                    },
                },
                {
                    type: 'function',
                    function: {
                        function: this.archiveFlag,
                        name: 'archiveFlag',
                        description:
                            'Archive a feature flag by name and project',
                        parse: JSON.parse,
                        parameters: {
                            type: 'object',
                            properties: {
                                project: { type: 'string' },
                                flag: { type: 'string' },
                            },
                            required: ['project', 'flag'],
                        },
                    },
                },
            ],
        });
    }

    createChatCompletionStream(
        messages: ChatCompletionMessageParam[],
    ): ChatCompletionStream {
        const client = this.getClient();

        return client.beta.chat.completions.stream({
            model: 'gpt-4o-mini',
            messages,
        });
    }
}
