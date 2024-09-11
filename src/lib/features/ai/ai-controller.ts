import type { Response } from 'express';
import Controller from '../../routes/controller';

import { NONE } from '../../types/permissions';
import type { IUnleashConfig } from '../../types/option';
import type { IUnleashServices } from '../../types/services';
import type { Logger } from '../../logger';

import { getStandardResponses } from '../../openapi/util/standard-responses';
import { createRequestSchema, createResponseSchema } from '../../openapi';
import type { IAuthRequest } from '../../server-impl';
import type { OpenApiService } from '../../services';
import { type AIPromptSchema, aiPromptSchema } from '../../openapi';
import type { AIService } from './ai-service';

export class AIController extends Controller {
    private logger: Logger;

    // private openApiService: OpenApiService;

    aiService: AIService;

    constructor(
        config: IUnleashConfig,
        {
            openApiService,
            aiService,
        }: Pick<IUnleashServices, 'openApiService' | 'aiService'>,
    ) {
        super(config);
        this.logger = config.getLogger('features/ai/ai-controller.ts');
        // this.openApiService = openApiService;
        this.aiService = aiService;

        this.route({
            method: 'post',
            path: '',
            handler: this.promptWithTools,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Unstable'],
                    operationId: 'prompt',
                    summary: 'Prompts Unleash AI',
                    description: 'This endpoint is used to prompt Unleash AI.',
                    requestBody: createRequestSchema(aiPromptSchema.$id),
                    responses: {
                        // 200: createResponseSchema(aiPromptResponseSchema.$id),
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: 'tools',
            handler: this.promptWithTools,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Unstable'],
                    operationId: 'promptWithTools',
                    summary: 'Prompts Unleash AI',
                    description: 'This endpoint is used to prompt Unleash AI.',
                    requestBody: createRequestSchema(aiPromptSchema.$id),
                    responses: {
                        // 200: createResponseSchema(aiPromptResponseSchema.$id),
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: 'stream',
            handler: this.promptStream,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Unstable'],
                    operationId: 'prompt',
                    summary: 'Prompts Unleash AI',
                    description: 'This endpoint is used to prompt Unleash AI.',
                    requestBody: createRequestSchema(aiPromptSchema.$id),
                    responses: {
                        // 200: createResponseSchema(aiPromptResponseSchema.$id),
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });
    }

    async prompt(
        req: IAuthRequest<never, never, AIPromptSchema, never>,
        res: Response,
    ): Promise<void> {
        const { messages } = req.body;

        try {
            const responseMessages =
                await this.aiService.createChatCompletion(messages);

            const response = responseMessages.choices[0].message.content || '';

            res.json({ response });
        } catch (error) {
            console.error('Error', error);
            res.status(500).send('Error');
        }
    }

    async promptWithTools(
        req: IAuthRequest<never, never, AIPromptSchema, never>,
        res: Response,
    ): Promise<void> {
        const { messages } = req.body;

        try {
            const runner =
                this.aiService.createChatCompletionWithTools(messages);

            const response = await runner.finalContent();

            res.json({ response });
        } catch (error) {
            console.error('Error', error);
            throw new Error('Error');
        }
    }

    async promptStream(
        req: IAuthRequest<never, never, AIPromptSchema, never>,
        res: Response,
    ): Promise<void> {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const { messages } = req.body;

        try {
            const stream = this.aiService.createChatCompletionStream(messages);

            for await (const part of stream) {
                const text = part.choices[0].delta?.content || '';
                res.write(text);
            }

            res.write('event: end\n\n');
            res.end();
        } catch (error) {
            console.error('Error during streaming:', error);
            res.status(500).send('Error during streaming');
        }
    }
}
