import useSWR, { mutate, type SWRConfiguration } from 'swr';
import { formatApiPath } from 'utils/formatPath';

import handleErrorResponses from '../httpErrorResponseHandler';
import type { GetProjectsParams, ProjectsSchema } from 'openapi';

const useProjects = (options: SWRConfiguration & GetProjectsParams = {}) => {
    const KEY = `api/admin/projects${options.archived ? '?archived=true' : ''}`;

    const fetcher = async () => {
        const path = formatApiPath(KEY);
        const doFetch = async () =>
            fetch(path, { method: 'GET' })
                .then(handleErrorResponses('Projects'))
                .then((res) => res.json());

        try {
            return await doFetch();
        } catch (error) {
            // Retry once after 1 second
            await new Promise((resolve) => setTimeout(resolve, 1_000));
            return doFetch();
        }
    };

    const { data, error } = useSWR<{ projects: ProjectsSchema['projects'] }>(
        KEY,
        fetcher,
        options,
    );
    // const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(KEY);
    };

    // useEffect(() => {
    //     setLoading(!error && !data);
    // }, [data, error]);

    return {
        projects: data?.projects || [],
        error,
        loading: !error && !data,
        refetch,
    };
};

export default useProjects;
