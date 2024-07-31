import { Switch, FormControlLabel, useMediaQuery } from '@mui/material';
import EventJson from 'component/events/EventJson/EventJson';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import EventCard from 'component/events/EventCard/EventCard';
import { useEventSettings } from 'hooks/useEventSettings';
import { useState, useEffect } from 'react';
import { Search } from 'component/common/Search/Search';
import theme from 'themes/theme';
import { useEventSearch } from 'hooks/api/getters/useEventSearch/useEventSearch';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useOnVisible } from 'hooks/useOnVisible';
import type { IEvent } from 'interfaces/event';
import { styled } from '@mui/system';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';
import { EventLogFilters } from './EventLogFilters';

interface IEventLogProps {
    title: string;
    project?: string;
    feature?: string;
}

const StyledEventsList = styled('ul')(({ theme }) => ({
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    display: 'grid',
    gap: theme.spacing(2),
}));

export const EventLog = ({ title, project, feature }: IEventLogProps) => {
    const [query, setQuery] = useState('');
    const { events, totalEvents, fetchNextPage } = useEventSearch(
        project,
        feature,
        query,
    );
    const fetchNextPageRef = useOnVisible<HTMLDivElement>(fetchNextPage);
    const { eventSettings, setEventSettings } = useEventSettings();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const { isEnterprise } = useUiConfig();
    const showFilters = useUiFlag('newEventSearch');

    // Cache the previous search results so that we can show those while
    // fetching new results for a new search query in the background.
    const [cache, setCache] = useState<IEvent[]>();
    useEffect(() => events && setCache(events), [events]);

    const onShowData = () => {
        setEventSettings((prev) => ({ showData: !prev.showData }));
    };

    const searchInputField = <Search onChange={setQuery} debounceTime={500} />;

    const showDataSwitch = (
        <FormControlLabel
            label='Full events'
            control={
                <Switch
                    checked={eventSettings.showData}
                    onChange={onShowData}
                    color='primary'
                />
            }
        />
    );

    const logType = project ? 'project' : feature ? 'flag' : 'global';
    const count = events?.length || 0;
    const totalCount = totalEvents || 0;
    const countText = `${count} of ${totalCount}`;

    return (
        <PageContent
            header={
                <PageHeader
                    title={`${title} (${countText})`}
                    actions={
                        <>
                            {showDataSwitch}
                            {!isSmallScreen && searchInputField}
                        </>
                    }
                >
                    {isSmallScreen && searchInputField}
                </PageHeader>
            }
        >
            <ConditionallyRender
                condition={isEnterprise() && showFilters}
                show={<EventLogFilters logType={logType} />}
            />
            <ConditionallyRender
                condition={Boolean(cache && cache.length === 0)}
                show={<p>No events found.</p>}
            />
            <ConditionallyRender
                condition={Boolean(cache && cache.length > 0)}
                show={
                    <StyledEventsList>
                        {cache?.map((entry) => (
                            <ConditionallyRender
                                key={entry.id}
                                condition={eventSettings.showData}
                                show={() => <EventJson entry={entry} />}
                                elseShow={() => <EventCard entry={entry} />}
                            />
                        ))}
                    </StyledEventsList>
                }
            />
            <div ref={fetchNextPageRef} />
        </PageContent>
    );
};
