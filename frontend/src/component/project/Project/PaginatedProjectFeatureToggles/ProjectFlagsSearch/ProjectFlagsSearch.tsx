import type { FC } from 'react';
import { Box } from '@mui/material';
import { Search } from 'component/common/Search/Search';
import useLoading from 'hooks/useLoading';
import { useTracking } from 'hooks/useTracking';
import { flagsSearchedTracking } from 'component/feature/FeatureToggleList/searchTracking';

interface IProjectFlagsSearchProps {
    isLoading?: boolean;
    searchQuery?: string;
    onChangeSearchQuery?: (query: string) => void;
}

export const ProjectFlagsSearch: FC<IProjectFlagsSearchProps> = ({
    isLoading,
    searchQuery,
    onChangeSearchQuery,
}) => {
    const headerLoadingRef = useLoading(isLoading || false);
    const trackFlagsSearched = useTracking(flagsSearchedTracking('project'));
    const handleSearch = (query: string) => {
        onChangeSearchQuery?.(query);
        trackFlagsSearched('succeeded', { queryLength: query.length });
    };

    return (
        <Box ref={headerLoadingRef} aria-busy={isLoading} aria-live='polite'>
            <Search
                placeholder='Search'
                expandable
                initialValue={searchQuery || ''}
                onChange={handleSearch}
                hasFilters
                id='projectFeatureFlags'
            />
        </Box>
    );
};
