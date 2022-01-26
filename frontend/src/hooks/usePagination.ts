import { useEffect, useState } from 'react';
import { paginate } from '../utils/paginate';

const usePagination = (
    data: any[],
    limit: number,
    filterFunc?: (item: any) => boolean
) => {
    const [paginatedData, setPaginatedData] = useState([[]]);
    const [pageIndex, setPageIndex] = useState(0);

    useEffect(() => {
        let dataToPaginate = data;

        if (filterFunc) {
            dataToPaginate = data.filter(filterFunc);
        }

        const result = paginate(dataToPaginate, limit);
        setPaginatedData(result);
        /* eslint-disable-next-line */
    }, [data, limit]);

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
