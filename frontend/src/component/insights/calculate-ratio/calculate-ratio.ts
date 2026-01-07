export const calculateRatio = (
    antecedent: number,
    consequent: number,
): string => {
    if (consequent === 0) {
        return 'N/A';
    }
    const ratio = Math.round((antecedent / consequent) * 100);

    return `${ratio}%`;
};
