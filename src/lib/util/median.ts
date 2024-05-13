export const median = (numbers: number[]): number => {
    numbers.sort((a, b) => a - b);
    const midIndex = Math.floor(numbers.length / 2);
    if (numbers.length % 2 === 0) {
        return (numbers[midIndex - 1] + numbers[midIndex]) / 2;
    } else {
        return numbers[midIndex];
    }
};
