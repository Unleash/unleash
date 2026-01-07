export const batchExecute = async <T>(
    items: T[],
    batchSize: number,
    delayMs: number,
    executeFn: (item: T) => void,
) => {
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);

        // Execute function for each item in the batch sequentially, fire-and-forget
        batch.forEach((item) => {
            executeFn(item);
        });

        if (i + batchSize < items.length) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }
};
