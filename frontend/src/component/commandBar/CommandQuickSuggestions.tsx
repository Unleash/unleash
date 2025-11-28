import {
    CommandResultGroup,
    RecentlyVisitedFeatureButton,
    RecentlyVisitedPathButton,
    RecentlyVisitedProjectButton,
} from './RecentlyVisited/CommandResultGroup.tsx';
import {
    useRecentlyVisited,
    type LastViewedPage,
} from 'hooks/useRecentlyVisited';

const toListItemButton = (
    item: LastViewedPage,
    routes: Record<string, { path: string; title: string }>,
    index: number,
    onClick: () => void,
) => {
    const key = `recently-visited-${index}`;
    if (item.featureId && item.projectId) {
        return (
            <RecentlyVisitedFeatureButton
                keyName={key}
                key={key}
                featureId={item.featureId}
                projectId={item.projectId}
                onClick={onClick}
            />
        );
    }
    if (item.projectId) {
        return (
            <RecentlyVisitedProjectButton
                keyName={key}
                key={key}
                projectId={item.projectId}
                onClick={onClick}
            />
        );
    }
    if (!item.pathName) return null;
    const name = routes[item.pathName]?.title ?? item.pathName;
    return (
        <RecentlyVisitedPathButton
            keyName={key}
            key={key}
            path={item.pathName}
            name={name}
            onClick={onClick}
        />
    );
};

export const CommandQuickSuggestions = ({
    routes,
    onClick,
}: {
    onClick: () => void;
    routes: Record<string, { path: string; title: string }>;
}) => {
    const { lastVisited } = useRecentlyVisited();
    const buttons = lastVisited.map((item, index) =>
        toListItemButton(item, routes, index, onClick),
    );
    return (
        <CommandResultGroup
            icon='default'
            groupName='Quick suggestions'
            onClick={onClick}
        >
            {buttons}
        </CommandResultGroup>
    );
};
