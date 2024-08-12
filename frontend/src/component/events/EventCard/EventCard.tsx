import EventDiff from 'component/events/EventDiff/EventDiff';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMDHMS } from 'utils/formatDate';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material';
import type { EventSchema } from 'openapi';

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

    const createdAtFormatted = formatDateYMDHMS(
        entry.createdAt,
        locationSettings.locale,
    );

    return (
        <StyledContainerListItem>
            <dl>
                <StyledDefinitionTerm>Event id:</StyledDefinitionTerm>
                <dd>{entry.id}</dd>
                <StyledDefinitionTerm>Changed at:</StyledDefinitionTerm>
                <dd>{createdAtFormatted}</dd>
                <StyledDefinitionTerm>Event:</StyledDefinitionTerm>
                <dd>{entry.type}</dd>
                <StyledDefinitionTerm>Changed by:</StyledDefinitionTerm>
                <dd title={entry.createdBy}>{entry.createdBy}</dd>
                {entry.project ? (
                    <>
                        <StyledDefinitionTerm>Project:</StyledDefinitionTerm>
                        <dd>
                            <Link to={`/projects/${entry.project}`}>
                                {entry.project}
                            </Link>
                        </dd>
                    </>
                ) : null}
                {entry.featureName ? (
                    <>
                        <StyledDefinitionTerm>Feature:</StyledDefinitionTerm>
                        <dd>
                            <Link
                                to={`/projects/${entry.project}/features/${entry.featureName}`}
                            >
                                {entry.featureName}
                            </Link>
                        </dd>
                    </>
                ) : null}
                {entry.environment ? (
                    <>
                        <StyledDefinitionTerm>
                            Environment:
                        </StyledDefinitionTerm>
                        <dd>{entry.environment}</dd>
                    </>
                ) : null}
            </dl>
            {entry.data || entry.preData ? (
                <StyledCodeSection>
                    <StyledChangesTitle>Changes:</StyledChangesTitle>
                    <EventDiff entry={entry} />
                </StyledCodeSection>
            ) : null}
        </StyledContainerListItem>
    );
};

export default EventCard;
