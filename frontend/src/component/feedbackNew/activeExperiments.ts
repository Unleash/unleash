import type { FeedbackSchema } from 'openapi';

export interface ActiveExperiment {
    category: string;
    commentCount: number;
    averageScore: string;
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

        const validScores = items
            .filter((item) => item.difficultyScore !== null)
            .map((item) => item.difficultyScore as number);

        const averageScore =
            validScores.length > 0
                ? (
                      validScores.reduce((sum, score) => sum + score, 0) /
                      validScores.length
                  ).toFixed(1)
                : 'N/A';

        return {
            category,
            commentCount,
            averageScore,
        };
    });
}
