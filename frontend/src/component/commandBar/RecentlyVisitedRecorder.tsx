import { useRecentlyVisited } from 'hooks/useRecentlyVisited';
import { useLocation, useMatch } from 'react-router-dom';
import { routes } from 'component/menu/routes';
import { useEffect } from 'react';

export const RecentlyVisitedRecorder = () => {
    const { setLastVisited } = useRecentlyVisited();
    const featureMatch = useMatch('/projects/:projectId/features/:featureId');
    const projectMatch = useMatch('/projects/:projectId');

    const location = useLocation();

    useEffect(() => {
        if (!location.pathname) return;

        const path = routes.find(
            (r) =>
                r.path === location.pathname && r.path.indexOf('/', 1) === -1,
        );
        if (path) {
            setLastVisited({ pathName: path.path });
        } else if (featureMatch?.params.featureId) {
            setLastVisited({
                featureId: featureMatch?.params.featureId,
                projectId: featureMatch?.params.projectId,
            });
        } else if (projectMatch?.params.projectId) {
            setLastVisited({
                projectId: projectMatch?.params.projectId,
            });
        }
    }, [location, featureMatch, projectMatch]);
    return <></>;
};
