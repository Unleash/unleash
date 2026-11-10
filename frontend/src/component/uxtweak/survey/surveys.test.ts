import { describe, expect, it } from 'vitest';
import {
    MAX_QUESTIONS,
    pageMatches,
    parseSurveyPayload,
    scanSurveys,
} from './surveys.ts';

const FLAG = 'uxtweak-survey-projects-abc1';

const payloadWith = (overrides: Record<string, unknown> = {}) => ({
    type: 'json',
    value: JSON.stringify({
        v: 1,
        surveyId: 'sv_1',
        page: '/projects',
        title: 'Quick feedback',
        intro: 'Two questions.',
        questions: [
            {
                id: 'q1',
                type: 'rating',
                prompt: 'Rate this page',
                required: true,
            },
            {
                id: 'q2',
                type: 'single',
                prompt: 'How often are you here?',
                options: ['Daily', 'Weekly'],
                required: false,
            },
            {
                id: 'q3',
                type: 'text',
                prompt: 'Anything else?',
                required: false,
            },
        ],
        submitBase: 'https://uxtweak.example.com',
        ...overrides,
    }),
});

describe('parseSurveyPayload', () => {
    it('parses a valid payload, all question types included', () => {
        expect(parseSurveyPayload(FLAG, payloadWith())).toMatchObject({
            flagName: FLAG,
            surveyId: 'sv_1',
            page: '/projects',
            title: 'Quick feedback',
            intro: 'Two questions.',
            questions: [
                {
                    id: 'q1',
                    type: 'rating',
                    prompt: 'Rate this page',
                    required: true,
                },
                {
                    id: 'q2',
                    type: 'single',
                    prompt: 'How often are you here?',
                    options: ['Daily', 'Weekly'],
                    required: false,
                },
                {
                    id: 'q3',
                    type: 'text',
                    prompt: 'Anything else?',
                    required: false,
                },
            ],
            submitBase: 'https://uxtweak.example.com',
        });
    });

    it('normalizes messy fields — submitBase slashes stripped, missing intro defaults', () => {
        const survey = parseSurveyPayload(
            FLAG,
            payloadWith({
                submitBase: 'https://uxtweak.example.com/',
                intro: undefined,
            }),
        );
        expect(survey).toMatchObject({
            submitBase: 'https://uxtweak.example.com',
            intro: '',
        });
    });

    it('rejects unknown payload versions — future shapes must not half-render', () => {
        expect(parseSurveyPayload(FLAG, payloadWith({ v: 2 }))).toBeNull();
    });

    it('rejects payloads that are not JSON objects', () => {
        expect(parseSurveyPayload(FLAG, undefined)).toBeNull();
        expect(
            parseSurveyPayload(FLAG, { type: 'string', value: 'hello' }),
        ).toBeNull();
        expect(
            parseSurveyPayload(FLAG, { type: 'json', value: 'not json' }),
        ).toBeNull();
        // JSON null parses fine but is not an object — this used to throw.
        expect(
            parseSurveyPayload(FLAG, { type: 'json', value: 'null' }),
        ).toBeNull();
    });

    it('rejects a payload missing any required field', () => {
        for (const field of ['surveyId', 'page', 'title', 'submitBase']) {
            expect(
                parseSurveyPayload(FLAG, payloadWith({ [field]: '' })),
            ).toBeNull();
        }
    });

    it('rejects the whole survey when one question is malformed', () => {
        const unknownType = [
            {
                id: 'q1',
                type: 'rating',
                prompt: 'Fine question',
                required: true,
            },
            { id: 'q2', type: 'mystery', prompt: 'Unknown type' },
        ];
        expect(
            parseSurveyPayload(FLAG, payloadWith({ questions: unknownType })),
        ).toBeNull();

        const emptyOptions = [
            { id: 'q1', type: 'single', prompt: 'Pick one', options: [] },
        ];
        expect(
            parseSurveyPayload(FLAG, payloadWith({ questions: emptyOptions })),
        ).toBeNull();
    });

    it('rejects empty and oversized question lists', () => {
        expect(
            parseSurveyPayload(FLAG, payloadWith({ questions: [] })),
        ).toBeNull();
        const tooMany = Array.from({ length: MAX_QUESTIONS + 1 }, (_, i) => ({
            id: `q${i}`,
            type: 'rating',
            prompt: 'One too many',
            required: false,
        }));
        expect(
            parseSurveyPayload(FLAG, payloadWith({ questions: tooMany })),
        ).toBeNull();
    });
});

describe('pageMatches', () => {
    it('matches exact paths and the wildcard, tolerating trailing slashes', () => {
        expect(pageMatches('/projects', '/projects')).toBe(true);
        expect(pageMatches('/projects/', '/projects')).toBe(true);
        expect(pageMatches('/projects', '/projects/')).toBe(true);
        expect(pageMatches('/projects', '/features')).toBe(false);
        expect(pageMatches('/', '/')).toBe(true);
        expect(pageMatches('*', '/anything/at/all')).toBe(true);
    });
});

// The frontend API only returns flags that evaluated true for this visitor,
// so every fixture flag is enabled.
const flag = (name: string, payload?: { type: string; value: string }) => ({
    name,
    enabled: true,
    variant: { name: 'config', enabled: true, feature_enabled: true, payload },
    impressionData: false,
});

describe('scanSurveys', () => {
    it('returns only valid survey flags matching the page', () => {
        const flags = [
            flag(FLAG, payloadWith()),
            flag(
                'uxtweak-survey-elsewhere-abc2',
                payloadWith({ page: '/elsewhere' }),
            ),
            flag('uxtweak-chat-projects-abc3', payloadWith()),
            flag('unrelated-flag', payloadWith()),
            flag('uxtweak-survey-projects-abc4', {
                type: 'json',
                value: 'not json at all',
            }),
        ];
        const found = scanSurveys(flags, '/projects');
        expect(found).toHaveLength(1);
        expect(found[0].flagName).toBe(FLAG);
    });

    it('orders surveys by flag name regardless of SDK order', () => {
        const flags = [
            flag('uxtweak-survey-projects-bbb2', payloadWith()),
            flag('uxtweak-survey-projects-aaa1', payloadWith()),
        ];
        expect(
            scanSurveys(flags, '/projects').map((survey) => survey.flagName),
        ).toEqual([
            'uxtweak-survey-projects-aaa1',
            'uxtweak-survey-projects-bbb2',
        ]);
    });
});
