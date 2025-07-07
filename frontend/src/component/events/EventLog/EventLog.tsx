import { Switch, FormControlLabel, useMediaQuery } from '@mui/material';
import EventJson from 'component/events/EventJson/EventJson';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import EventCard from 'component/events/EventCard/EventCard';
import { useEventSettings } from 'hooks/useEventSettings';
import { Search } from 'component/common/Search/Search';
import theme from 'themes/theme';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { styled } from '@mui/system';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { EventLogFilters } from './EventLogFilters.tsx';
import { useEventLogSearch } from './useEventLogSearch.ts';
import { StickyPaginationBar } from 'component/common/Table/StickyPaginationBar/StickyPaginationBar';
import { EventActions } from './EventActions.tsx';
import useLoading from 'hooks/useLoading';

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

const StyledFilters = styled(EventLogFilters)({
    padding: 0,
});

const EventResultWrapper = styled('div', {
    shouldForwardProp: (prop) => prop !== 'withFilters',
})<{ withFilters: boolean }>(({ theme, withFilters }) => ({
    padding: theme.spacing(withFilters ? 2 : 4, 4, 4, 4),
    display: 'flex',
    flexFlow: 'column',
    gap: theme.spacing(2),
}));

const Placeholder = styled('li')({
    height: '246px',
    borderRadius: theme.shape.borderRadiusLarge,
    '&[data-loading-events=true]': { zIndex: '1' }, // .skeleton has z-index: 9990
});

export const EventLog = ({ title, project, feature }: IEventLogProps) => {
    const { isEnterprise } = useUiConfig();
    const showFilters = isEnterprise();
    const {
        events,
        total,
        loading,
        tableState,
        setTableState,
        filterState,
        pagination,
    } = useEventLogSearch(
        project
            ? { type: 'project', projectId: project }
            : feature
              ? { type: 'flag', flagName: feature }
              : { type: 'global' },
    );
    const ref = useLoading(loading, '[data-loading-events=true]');

    const setSearchValue = (query = '') => {
        setTableState({ query });
    };
    const { eventSettings, setEventSettings } = useEventSettings();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const onShowData = () => {
        setEventSettings((prev) => ({ showData: !prev.showData }));
    };

    const searchInputField = (
        <Search
            onChange={setSearchValue}
            initialValue={tableState.query || ''}
            debounceTime={500}
        />
    );

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

    const ResultComponent = () => {
        if (loading) {
            return (
                <StyledEventsList>
                    {Array.from({ length: pagination.pageSize }).map((_, i) => (
                        <Placeholder
                            data-loading-events='true'
                            key={`event-skeleton-${i}`}
                        />
                    ))}
                </StyledEventsList>
            );
        } else if (events.length === 0) {
            return <p>No events found.</p>;
        } else {
            return (
                <StyledEventsList>
                    {events.map((entry) => (
                        <ConditionallyRender
                            key={entry.id}
                            condition={eventSettings.showData}
                            show={<EventJson entry={entry} />}
                            elseShow={<EventCard entry={entry} />}
                        />
                    ))}
                </StyledEventsList>
            );
        }
    };

    return (
        <>
            <PageContent
                bodyClass={'no-padding'}
                header={
                    <PageHeader
                        title={`${title} (${total})`}
                        actions={
                            <>
                                {showDataSwitch}
                                <EventActions events={events} />
                                {!isSmallScreen && searchInputField}
                            </>
                        }
                    >
                        {isSmallScreen && searchInputField}
                    </PageHeader>
                }
            >
                <EventResultWrapper ref={ref} withFilters={showFilters}>
                    <ConditionallyRender
                        condition={showFilters}
                        show={
                            <StyledFilters
                                logType={
                                    project
                                        ? 'project'
                                        : feature
                                          ? 'flag'
                                          : 'global'
                                }
                                state={filterState}
                                onChange={setTableState}
                            />
                        }
                    />
                    <ResultComponent />
                </EventResultWrapper>
                <ConditionallyRender
                    condition={total > 25}
                    show={
                        <StickyPaginationBar
                            totalItems={total}
                            pageSize={pagination.pageSize}
                            pageIndex={pagination.currentPage}
                            fetchPrevPage={pagination.prevPage}
                            fetchNextPage={pagination.nextPage}
                            setPageLimit={pagination.setPageLimit}
                        />
                    }
                />
            </PageContent>
        </>
    );
};
