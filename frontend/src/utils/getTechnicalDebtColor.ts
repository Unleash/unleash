/**
 * Consistent values for boundries between healthy, warning and error colors
 * @param technicalDebt {Number} 0-100
 */
export const getTechnicalDebtColor = (technicalDebt: number) => {
    if (technicalDebt >= 50) {
        return 'error';
    }
    if (technicalDebt >= 25) {
        return 'warning';
    }
    return 'success';
};
