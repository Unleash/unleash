import { Navigate, useSearchParams } from 'react-router';

export const FeaturesArchiveTable = () => {
    const [searchParams] = useSearchParams();
    const search = searchParams.get('search');

    const params = new URLSearchParams(searchParams);
    if (search) {
        params.set('query', search);
        params.delete('search');
    }
    params.set('lifecycle', 'IS:archived');

    return <Navigate to={`/search?${params.toString()}`} replace />;
};
