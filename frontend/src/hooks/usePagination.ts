import { useEffect, useState } from 'react';
import { paginate } from 'utils/paginate';

/**
 * @deprecated
 */
const usePagination = <T>(
    data: T[],
    limit: number,
    filterFunc?: (item: T) => boolean
) => {
    const [paginatedData, setPaginatedData] = useState<T[][]>([[]]);
    const [pageIndex, setPageIndex] = useState(0);

    useEffect(() => {
        let dataToPaginate = data;

        if (filterFunc) {
            dataToPaginate = data.filter(filterFunc);
        }

        const result = paginate(dataToPaginate, limit);
        setPageIndex(0);
        setPaginatedData(result);
        /* eslint-disable-next-line */
    }, [JSON.stringify(data), limit]);

    const nextPage = () => {
        if (pageIndex < paginatedData.length - 1) {
            setPageIndex(prev => prev + 1);
        }
    };

    const prevPage = () => {
        if (pageIndex > 0) {
            setPageIndex(prev => prev - 1);
        }
    };

    const lastPage = () => {
        setPageIndex(paginatedData.length - 1);
    };

    const firstPage = () => {
        setPageIndex(0);
    };

    return {
        page: paginatedData[pageIndex] || [],
        pages: paginatedData,
        nextPage,
        prevPage,
        lastPage,
        firstPage,
        setPageIndex,
        pageIndex,
    };
};

export default usePagination;
