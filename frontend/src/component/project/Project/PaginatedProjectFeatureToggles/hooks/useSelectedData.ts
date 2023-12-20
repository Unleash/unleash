import { useState, useEffect } from 'react';

export const useSelectedData = <T extends { name: string }>(
    data: T[],
    selection: Record<string, boolean>,
): T[] => {
    const [selectedData, setSelectedData] = useState<T[]>([]);

    useEffect(() => {
        setSelectedData((prevSelectedData) => {
            const combinedData = [...data];
            prevSelectedData.forEach((item) => {
                if (
                    !combinedData.find(
                        (dataItem) => dataItem.name === item.name,
                    )
                ) {
                    combinedData.push(item);
                }
            });

            return combinedData.filter((item) => selection[item.name]);
        });
    }, [data, selection]);

    return selectedData;
};
