export const paginate = (data: any[], limit: number) => {
    let result = [];
    let currentIdx = 0;

    if (data.length <= currentIdx) {
        return data;
    }

    while (currentIdx < data.length) {
        if (currentIdx === 0) {
            currentIdx += limit;
            const page = data.slice(0, currentIdx);
            result.push(page);
        } else {
            const page = data.slice(currentIdx, currentIdx + limit);
            currentIdx += limit;
            result.push(page);
        }
    }

    return result;
};
