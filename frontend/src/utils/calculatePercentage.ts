export const calculatePercentage = (total: number, part: number) => {
    if (total === 0) {
        return 0;
    }

    return Math.round((part / total) * 100);
};
