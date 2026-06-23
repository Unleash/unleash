import type { FeedbackSchema } from 'openapi';

// Score scale changed from 1-7 to 1-5 on this date; averages mix two scales
// otherwise, so we only average scores from on/after this date.
export const SCALE_CHANGE_DATE = new Date('2026-06-23T00:00:00Z');

export interface ActiveExperiment {
    category: string;
    commentCount: number;
    averageScore: string;
    hasLegacyScores: boolean;
}

export function getActiveExperiments(
    feedbackData: FeedbackSchema[],
): ActiveExperiment[] {
    if (!feedbackData || feedbackData.length === 0) return [];

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const lastThreeMonthsFeedback = feedbackData.filter((item) => {
        const createdAt = new Date(item.createdAt);
        return createdAt >= threeMonthsAgo;
    });

    const groupedByCategory = lastThreeMonthsFeedback.reduce(
        (acc: Record<string, FeedbackSchema[]>, item) => {
            const category = item.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        },
        {},
    );

    return Object.entries(groupedByCategory).map(([category, items]) => {
        const commentCount = items.length;

        const itemsWithScore = items.filter(
            (item) => item.difficultyScore !== null,
        );
        const currentScaleScores = itemsWithScore
            .filter((item) => new Date(item.createdAt) >= SCALE_CHANGE_DATE)
            .map((item) => item.difficultyScore as number);
        const hasLegacyScores =
            itemsWithScore.length > currentScaleScores.length;

        const averageScore =
            currentScaleScores.length > 0
                ? (
                      currentScaleScores.reduce(
                          (sum, score) => sum + score,
                          0,
                      ) / currentScaleScores.length
                  ).toFixed(1)
                : 'N/A';

        return {
            category,
            commentCount,
            averageScore,
            hasLegacyScores,
        };
    });
}
