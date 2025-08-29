export const calculateRatio = (
    antecedent: number,
    consequent: number,
): number => {
    const rawRatio = Math.round((antecedent / consequent) * 100);

    if (Number.isNaN(rawRatio) || rawRatio === Number.POSITIVE_INFINITY) {
        return 100;
    }

    return rawRatio;
};
