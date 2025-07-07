import {
    CommandResultGroup,
    type CommandResultGroupItem,
} from './RecentlyVisited/CommandResultGroup.tsx';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import { useEffect } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

export type CommandQueryCounter = {
    query: string;
    count: number;
};

interface ICommandBar {
    searchString: string;
    setSearchedFlagCount: (count: CommandQueryCounter) => void;
    onClick: () => void;
    setSearchLoading: (loading: boolean) => void;
}
export const CommandSearchFeatures = ({
    searchString,
    setSearchedFlagCount,
    onClick,
    setSearchLoading,
}: ICommandBar) => {
    const { features = [], loading } = useFeatureSearch(
        {
            query: searchString,
            limit: '3',
        },
        {
            revalidateOnFocus: false,
        },
        'command-bar-cache',
    );

    const flags: CommandResultGroupItem[] = features.map((feature) => ({
        name: feature.name,
        link: `/projects/${feature.project}/features/${feature.name}`,
        description: feature.description,
    }));

    useEffect(() => {
        setSearchedFlagCount({ count: flags.length, query: searchString });
    }, [loading]);

    useEffect(() => {
        setSearchLoading(loading);
    }, [loading]);

    return (
        <ConditionallyRender
            condition={!loading}
            show={
                <CommandResultGroup
                    groupName={'Flags'}
                    icon={'flag'}
                    items={flags}
                    onClick={onClick}
                />
            }
        />
    );
};
