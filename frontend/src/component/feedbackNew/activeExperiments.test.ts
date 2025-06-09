import { getActiveExperiments } from './activeExperiments.ts';
import type { FeedbackSchema } from 'openapi';

describe('getActiveExperiments', () => {
    const now = new Date();
    const twoMonthsAgo = new Date(now);
    twoMonthsAgo.setMonth(now.getMonth() - 2);

    const fourMonthsAgo = new Date(now);
    fourMonthsAgo.setMonth(now.getMonth() - 4);

    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);

    const mockFeedbackData: FeedbackSchema[] = [
        {
            id: 1,
            category: 'feature1',
            createdAt: now.toISOString(),
            difficultyScore: 5,
            areasForImprovement: null,
            positive: null,
            userType: 'developer',
        },
        {
            id: 2,
            category: 'feature1',
            createdAt: oneWeekAgo.toISOString(),
            difficultyScore: 3,
            areasForImprovement: null,
            positive: null,
            userType: 'developer',
        },
        {
            id: 3,
            category: 'feature2',
            createdAt: now.toISOString(),
            difficultyScore: null,
            areasForImprovement: null,
            positive: null,
            userType: 'developer',
        },
        {
            id: 4,
            category: 'feature2',
            createdAt: oneWeekAgo.toISOString(),
            difficultyScore: 6,
            areasForImprovement: null,
            positive: null,
            userType: 'developer',
        },
        {
            id: 5,
            category: 'feature3',
            createdAt: fourMonthsAgo.toISOString(),
            difficultyScore: 7,
            areasForImprovement: null,
            positive: null,
            userType: 'developer',
        },
    ];

    it('should return empty array for empty input', () => {
        expect(getActiveExperiments([])).toEqual([]);
    });

    it('should return empty array for null input', () => {
        expect(
            getActiveExperiments(null as unknown as FeedbackSchema[]),
        ).toEqual([]);
    });

    it('should filter out feedback older than three months', () => {
        const result = getActiveExperiments(mockFeedbackData);
        expect(result.length).toBe(2); // Only feature1 and feature2 have recent feedback
        expect(
            result.find((item) => item.category === 'feature3'),
        ).toBeUndefined();
    });

    it('should count comments correctly', () => {
        const result = getActiveExperiments(mockFeedbackData);
        const feature1 = result.find((item) => item.category === 'feature1');
        const feature2 = result.find((item) => item.category === 'feature2');

        expect(feature1?.commentCount).toBe(2);
        expect(feature2?.commentCount).toBe(2);
    });

    it('should calculate average score correctly', () => {
        const result = getActiveExperiments(mockFeedbackData);
        const feature1 = result.find((item) => item.category === 'feature1');

        // (5 + 3) / 2 = 4.0
        expect(feature1?.averageScore).toBe('4.0');
    });

    it('should handle null difficulty scores', () => {
        const result = getActiveExperiments(mockFeedbackData);
        const feature2 = result.find((item) => item.category === 'feature2');

        // Only one valid score of 6
        expect(feature2?.averageScore).toBe('6.0');
    });

    it('should include feedback between 1 and 3 months old', () => {
        const twoMonthOldData: FeedbackSchema[] = [
            {
                id: 7,
                category: 'feature4',
                createdAt: twoMonthsAgo.toISOString(),
                difficultyScore: 5,
                areasForImprovement: null,
                positive: null,
                userType: 'developer',
            },
        ];

        const result = getActiveExperiments(twoMonthOldData);
        expect(result.length).toBe(1);
        expect(result[0].category).toBe('feature4');
    });

    it('should return N/A when all scores are null', () => {
        const allNullScores: FeedbackSchema[] = [
            {
                id: 1,
                category: 'feature4',
                createdAt: now.toISOString(),
                difficultyScore: null,
                areasForImprovement: null,
                positive: null,
                userType: 'developer',
            },
        ];

        const result = getActiveExperiments(allNullScores);
        expect(result[0].averageScore).toBe('N/A');
    });

    it('should sort results by comment count in descending order', () => {
        const moreData: FeedbackSchema[] = [
            ...mockFeedbackData,
            {
                id: 6,
                category: 'feature2',
                createdAt: now.toISOString(),
                difficultyScore: 4,
                areasForImprovement: null,
                positive: null,
                userType: 'developer',
            },
        ];

        const result = getActiveExperiments(moreData);

        // feature2 should be first with 3 comments, feature1 second with 2 comments
        expect(result[0].category).toBe('feature2');
        expect(result[1].category).toBe('feature1');
    });
});
