import { EventDiff } from 'component/events/EventDiff/EventDiff';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMDHMS } from 'utils/formatDate';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material';
import type { EventSchema } from 'openapi';
import { useLocation } from 'react-router-dom';

interface IEventCardProps {
    entry: EventSchema;
}

const StyledDefinitionTerm = styled('dt')(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const StyledChangesTitle = styled('strong')(({ theme }) => ({
    fontWeight: 'inherit',
    color: theme.palette.text.secondary,
}));

const StyledContainerListItem = styled('li')(({ theme }) => ({
    display: 'grid',
    backgroundColor: theme.palette.neutral.light,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(0.5),
    [theme.breakpoints.up('md')]: {
        gridTemplateColumns: '2fr 3fr',
    },

    '& dl': {
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        alignContent: 'start',
        gap: theme.spacing(1),
        padding: theme.spacing(2),
        [theme.breakpoints.up('md')]: {
            padding: theme.spacing(4),
        },
    },

    '& dd': {
        overflowWrap: 'anywhere',
    },

    a: {
        color: theme.palette.links,
    },
}));

export const StyledCodeSection = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    overflowX: 'auto',
    padding: theme.spacing(2),
    borderBottomLeftRadius: theme.shape.borderRadiusLarge,
    borderBottomRightRadius: theme.shape.borderRadiusLarge,
    [theme.breakpoints.up('md')]: {
        padding: theme.spacing(4),
        borderRadius: 0,
        borderTopRightRadius: theme.shape.borderRadiusLarge,
        borderBottomRightRadius: theme.shape.borderRadiusLarge,
    },

    '& code': {
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace',
        lineHeight: 1.5,
        fontSize: theme.fontSizes.smallBody,
    },
}));

const EventCard = ({ entry }: IEventCardProps) => {
    const { locationSettings } = useLocationSettings();
    const location = useLocation();

    const createdAtFormatted = formatDateYMDHMS(
        entry.createdAt,
        locationSettings.locale,
    );

    const getGroupIdLink = () => {
        const searchParams = new URLSearchParams(location.search);
        searchParams.set('groupId', `IS:${entry.groupId}`);
        return `${location.pathname}?${searchParams.toString()}`;
    };

    return (
        <StyledContainerListItem>
            <dl>
                <StyledDefinitionTerm>Event id:</StyledDefinitionTerm>
                <dd>{entry.id}</dd>
                <ConditionallyRender
                    condition={entry.groupId !== undefined}
                    show={
                        <>
                            <StyledDefinitionTerm>
                                Group id:
                            </StyledDefinitionTerm>
                            <dd>
                                <Link to={getGroupIdLink()}>
                                    {entry.groupId}
                                </Link>
                            </dd>
                        </>
                    }
                />
                <StyledDefinitionTerm>Changed at:</StyledDefinitionTerm>
                <dd>{createdAtFormatted}</dd>
                <StyledDefinitionTerm>Event:</StyledDefinitionTerm>
                <dd>{entry.type}</dd>
                <StyledDefinitionTerm>Changed by:</StyledDefinitionTerm>
                <dd title={entry.createdBy}>{entry.createdBy}</dd>
                {entry.ip && (
                    <>
                        <StyledDefinitionTerm>IP:</StyledDefinitionTerm>
                        <dd title={entry.ip}>{entry.ip}</dd>
                    </>
                )}
                <ConditionallyRender
                    condition={Boolean(entry.project)}
                    show={
                        <>
                            <StyledDefinitionTerm>
                                Project:
                            </StyledDefinitionTerm>
                            <dd>
                                <Link to={`/projects/${entry.project}`}>
                                    {entry.project}
                                </Link>
                            </dd>
                        </>
                    }
                />
                <ConditionallyRender
                    condition={Boolean(entry.featureName)}
                    show={
                        <>
                            <StyledDefinitionTerm>
                                Feature:
                            </StyledDefinitionTerm>
                            <dd>
                                <Link
                                    to={`/projects/${entry.project}/features/${entry.featureName}`}
                                >
                                    {entry.featureName}
                                </Link>
                            </dd>
                        </>
                    }
                />
                <ConditionallyRender
                    condition={Boolean(entry.environment)}
                    show={
                        <>
                            <StyledDefinitionTerm>
                                Environment:
                            </StyledDefinitionTerm>
                            <dd>{entry.environment}</dd>
                        </>
                    }
                />
                <ConditionallyRender
                    condition={Boolean(entry.data?.changeRequestId)}
                    show={
                        <>
                            <StyledDefinitionTerm>
                                Change request id:
                            </StyledDefinitionTerm>
                            <dd>
                                <Link
                                    to={`/projects/${entry.project}/change-requests/${entry.data?.changeRequestId}`}
                                >
                                    {String(entry.data?.changeRequestId)}
                                </Link>
                            </dd>
                        </>
                    }
                />
            </dl>
            <ConditionallyRender
                condition={Boolean(entry.data || entry.preData)}
                show={
                    <StyledCodeSection>
                        <StyledChangesTitle>Changes:</StyledChangesTitle>
                        <EventDiff entry={entry} />
                    </StyledCodeSection>
                }
            />
        </StyledContainerListItem>
    );
};

export default EventCard;
