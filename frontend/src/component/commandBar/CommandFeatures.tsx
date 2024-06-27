import {
    CommandResultGroup,
    type CommandResultGroupItem,
} from './RecentlyVisited/CommandResultGroup';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import { useEffect } from 'react';

interface ICommandBar {
    searchString: string;
    setSearchedFlagCount: (count: number) => void;
}
export const CommandFeatures = ({
    searchString,
    setSearchedFlagCount,
}: ICommandBar) => {
    const { features = [] } = useFeatureSearch(
        {
            query: searchString,
            limit: '3',
        },
        {
            revalidateOnFocus: false,
        },
    );

    const flags: CommandResultGroupItem[] = features.map((feature) => ({
        name: feature.name,
        link: `/projects/${feature.project}/features/${feature.name}`,
        description: feature.description,
    }));

    useEffect(() => {
        setSearchedFlagCount(flags.length);
    }, [JSON.stringify(flags)]);

    return (
        <CommandResultGroup groupName={'Flags'} icon={'flag'} items={flags} />
    );
};
