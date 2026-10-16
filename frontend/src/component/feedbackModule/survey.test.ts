import { describe, expect, it } from 'vitest';
import { parseSurveyPayload, surveyTemplate } from './survey.ts';

const SUBMIT_BASE = 'https://app.unleash-hosted.com/hosted';
const SURVEY = surveyTemplate(SUBMIT_BASE);

const payload = (survey: object) => ({
    type: 'json',
    value: JSON.stringify(survey),
});

const withQuestions = (questions: unknown[]) => ({
    ...SURVEY,
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

describe('parseSurveyPayload', () => {
    it('parses a survey with every question type', () => {
        const survey = parseSurveyPayload('survey-onboarding', payload(SURVEY));

        expect(survey).toEqual({
            flagName: 'survey-onboarding',
            title: 'How was creating your flag?',
            description: 'Three quick questions.',
            submitBase: SUBMIT_BASE,
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
        const survey = parseSurveyPayload(
            'survey-onboarding',
            payload({
                kind: 'unleash-survey',
                version: 1,
                title: 'Title',
                questions: [{ id: 'rate', type: 'rating', prompt: 'Rate it' }],
                submitBase: SUBMIT_BASE,
            }),
        );

        expect(survey).toEqual({
            flagName: 'survey-onboarding',
            title: 'Title',
            description: '',
            submitBase: SUBMIT_BASE,
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

    it('strips trailing slashes from the submit base', () => {
        const survey = parseSurveyPayload(
            'survey-x',
            payload({
                ...SURVEY,
                submitBase: 'https://app.unleash-hosted.com/hosted/',
            }),
        );

        expect(survey?.submitBase).toBe(
            'https://app.unleash-hosted.com/hosted',
        );
    });

    it.each([2, 7, 10])('accepts a rating scale of %s', (scale) => {
        const survey = parseSurveyPayload(
            'survey-x',
            payload(withQuestions([ratingQuestion(scale)])),
        );

        expect(survey).toMatchObject({ questions: [{ scale }] });
    });

    it('accepts a survey with 10 questions', () => {
        const survey = parseSurveyPayload(
            'survey-x',
            payload(withQuestions(freeTextQuestions(10))),
        );

        expect(survey?.questions).toHaveLength(10);
    });

    it('rejects a flag name without the survey- prefix', () => {
        expect(parseSurveyPayload('onboarding', payload(SURVEY))).toBeNull();
    });

    it.each([
        ['is not marked as a survey', { ...SURVEY, kind: 'other' }],
        ['has an unknown version', { ...SURVEY, version: 2 }],
        ['has no title', { ...SURVEY, title: '' }],
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
        ['has no submit base', { ...SURVEY, submitBase: undefined }],
        [
            'has a submit base that is not a URL',
            { ...SURVEY, submitBase: 'hosted' },
        ],
        [
            'has a submit base that is not http or https',
            { ...SURVEY, submitBase: 'javascript:alert(1)' },
        ],
    ])('rejects a survey that %s', (_, survey) => {
        expect(parseSurveyPayload('survey-x', payload(survey))).toBeNull();
    });

    it.each([1, 11, 2.5])('rejects a rating scale of %s', (scale) => {
        const survey = withQuestions([ratingQuestion(scale)]);

        expect(parseSurveyPayload('survey-x', payload(survey))).toBeNull();
    });

    it.each([
        ['a non-JSON payload type', { type: 'string', value: '{}' }],
        ['invalid JSON', { type: 'json', value: '{' }],
        ['JSON null', { type: 'json', value: 'null' }],
        ['a JSON array', { type: 'json', value: '[]' }],
        ['no payload', undefined],
    ])('rejects %s', (_, surveyPayload) => {
        expect(parseSurveyPayload('survey-x', surveyPayload)).toBeNull();
    });
});
