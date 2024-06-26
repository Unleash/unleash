import {
    CommandResultGroup,
    type CommandResultGroupItem,
} from './RecentlyVisited/CommandResultGroup';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';

interface ICommandBar {
    searchString: string;
}
export const CommandFeatures = ({ searchString }: ICommandBar) => {
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

    return (
        <CommandResultGroup groupName={'Flags'} icon={'flag'} items={flags} />
    );
};
