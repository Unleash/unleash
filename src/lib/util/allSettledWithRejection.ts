export const allSettledWithRejection = (
    promises: Promise<any>[],
): Promise<any[]> =>
    new Promise((resolve, reject) => {
        Promise.allSettled(promises).then((results) => {
            for (const result of results) {
                if (result.status === 'rejected') {
                    reject(result.reason);
                    return;
                }
            }
            resolve(
                results.map((r) => (r as PromiseFulfilledResult<any>).value),
            );
        });
    });
