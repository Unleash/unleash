import { describe, expect, it } from 'vitest';
import {
    parseSurveyDefinition,
    parseSurveyPayload,
    SURVEY_KIND,
    SURVEY_VERSION,
} from './survey.ts';

const validSurvey = {
    kind: SURVEY_KIND,
    version: SURVEY_VERSION,
    title: 'How was creating your flag?',
    description: 'Three quick questions.',
    questions: [
        {
            id: 'ease',
            type: 'rating',
            prompt: 'How easy was it?',
            required: true,
            scale: 5,
        },
        {
            id: 'role',
            type: 'multi-choice',
            prompt: 'What is your role?',
            options: ['Developer', 'PM', 'Other'],
        },
        { id: 'comment', type: 'free-text', prompt: 'Anything else?' },
    ],
};

const SUBMIT_BASE = 'https://app.unleash-hosted.com/hosted';

const payload = (survey: object) => ({
    type: 'json',
    value: JSON.stringify({
        environmentId: 'development',
        submitBase: SUBMIT_BASE,
        ...survey,
    }),
});

const definition = (survey: unknown) =>
    parseSurveyDefinition(JSON.stringify(survey));

const withQuestions = (questions: unknown[]) => ({
    ...validSurvey,
    questions,
});

const freeTextQuestions = (count: number) =>
    Array.from({ length: count }, (_, i) => ({
        id: `q${i}`,
        type: 'free-text',
        prompt: 'Why?',
    }));

const ratingQuestion = (scale: number) => ({
    id: 'rate',
    type: 'rating',
    prompt: 'Rate',
    scale,
});

describe('parseSurveyDefinition', () => {
    it('parses a survey with every question type', () => {
        expect(definition(validSurvey)).toEqual({
            title: 'How was creating your flag?',
            description: 'Three quick questions.',
            questions: [
                {
                    id: 'ease',
                    type: 'rating',
                    prompt: 'How easy was it?',
                    required: true,
                    scale: 5,
                },
                {
                    id: 'role',
                    type: 'multi-choice',
                    prompt: 'What is your role?',
                    required: false,
                    options: ['Developer', 'PM', 'Other'],
                },
                {
                    id: 'comment',
                    type: 'free-text',
                    prompt: 'Anything else?',
                    required: false,
                },
            ],
        });
    });

    it('fills in defaults for optional fields', () => {
        const survey = definition({
            kind: 'unleash-survey',
            version: 1,
            title: 'Title',
            questions: [{ id: 'rate', type: 'rating', prompt: 'Rate it' }],
        });

        expect(survey).toEqual({
            title: 'Title',
            description: '',
            questions: [
                {
                    id: 'rate',
                    type: 'rating',
                    prompt: 'Rate it',
                    required: false,
                    scale: 5,
                },
            ],
        });
    });

    it.each([2, 7, 10])('accepts a rating scale of %s', (scale) => {
        const survey = definition(withQuestions([ratingQuestion(scale)]));

        expect(survey).toMatchObject({ questions: [{ scale }] });
    });

    it('accepts a survey with 10 questions', () => {
        const survey = definition(withQuestions(freeTextQuestions(10)));

        expect(survey?.questions).toHaveLength(10);
    });

    it.each([
        ['is not marked as a survey', { ...validSurvey, kind: 'other' }],
        ['has an unknown version', { ...validSurvey, version: 2 }],
        ['has no title', { ...validSurvey, title: '' }],
        ['has no questions', withQuestions([])],
        ['has more than 10 questions', withQuestions(freeTextQuestions(11))],
        ['has a question that is not an object', withQuestions([null])],
        [
            'has a question without an id',
            withQuestions([{ type: 'free-text', prompt: 'Why?' }]),
        ],
        [
            'has a question without a prompt',
            withQuestions([{ id: 'why', type: 'free-text' }]),
        ],
        [
            'has a question of unknown type',
            withQuestions([{ id: 'why', type: 'essay', prompt: 'Why?' }]),
        ],
        [
            'has a multi-choice question with no options field',
            withQuestions([
                { id: 'pick', type: 'multi-choice', prompt: 'Pick' },
            ]),
        ],
        [
            'has a multi-choice question with an empty options list',
            withQuestions([
                {
                    id: 'pick',
                    type: 'multi-choice',
                    prompt: 'Pick',
                    options: [],
                },
            ]),
        ],
        [
            'has a multi-choice question with an empty option',
            withQuestions([
                {
                    id: 'pick',
                    type: 'multi-choice',
                    prompt: 'Pick',
                    options: ['A', ''],
                },
            ]),
        ],
        [
            'has a multi-choice question with duplicate options',
            withQuestions([
                {
                    id: 'pick',
                    type: 'multi-choice',
                    prompt: 'Pick',
                    options: ['A', 'A'],
                },
            ]),
        ],
        [
            'has duplicate question ids',
            withQuestions([
                { id: 'why', type: 'free-text', prompt: 'Why?' },
                { id: 'why', type: 'free-text', prompt: 'Why not?' },
            ]),
        ],
    ])('rejects a survey that %s', (_, survey) => {
        expect(definition(survey)).toBeNull();
    });

    it.each([1, 11, 2.5])('rejects a rating scale of %s', (scale) => {
        expect(definition(withQuestions([ratingQuestion(scale)]))).toBeNull();
    });

    it.each([
        ['invalid JSON', '{'],
        ['JSON null', 'null'],
        ['a JSON array', '[]'],
    ])('rejects %s', (_, json) => {
        expect(parseSurveyDefinition(json)).toBeNull();
    });
});

describe('parseSurveyPayload', () => {
    it('reads the survey with the flag and environment it was created for', () => {
        const survey = parseSurveyPayload(
            'survey-onboarding',
            payload({ ...validSurvey, environmentId: 'production' }),
        );

        expect(survey).toMatchObject({
            flagName: 'survey-onboarding',
            environmentId: 'production',
            submitBase: SUBMIT_BASE,
            title: 'How was creating your flag?',
        });
    });

    it('strips trailing slashes from the submit base', () => {
        const survey = parseSurveyPayload(
            'survey-x',
            payload({
                ...validSurvey,
                submitBase: 'https://app.unleash-hosted.com/hosted/',
            }),
        );

        expect(survey?.submitBase).toBe(SUBMIT_BASE);
    });

    it('rejects a flag name without the survey- prefix', () => {
        expect(
            parseSurveyPayload('onboarding', payload(validSurvey)),
        ).toBeNull();
    });

    it('rejects an invalid survey', () => {
        expect(
            parseSurveyPayload('survey-x', payload(withQuestions([]))),
        ).toBeNull();
    });

    it.each([
        ['no environment', undefined],
        ['an empty environment', ''],
        ['a non-string environment', 42],
    ])('rejects a survey with %s', (_, environmentId) => {
        expect(
            parseSurveyPayload(
                'survey-x',
                payload({ ...validSurvey, environmentId }),
            ),
        ).toBeNull();
    });

    it.each([
        ['no submit base', undefined],
        ['a submit base that is not a URL', 'hosted'],
        ['a submit base that is not http or https', 'javascript:alert(1)'],
    ])('rejects a survey with %s', (_, submitBase) => {
        expect(
            parseSurveyPayload(
                'survey-x',
                payload({ ...validSurvey, submitBase }),
            ),
        ).toBeNull();
    });

    it.each([
        ['a non-JSON payload type', { type: 'string', value: '{}' }],
        ['invalid JSON', { type: 'json', value: '{' }],
        ['no payload', undefined],
    ])('rejects %s', (_, surveyPayload) => {
        expect(parseSurveyPayload('survey-x', surveyPayload)).toBeNull();
    });
});
