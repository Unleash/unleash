import EventDiff from 'component/events/EventDiff/EventDiff';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { IEvent } from 'interfaces/event';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMDHMS } from 'utils/formatDate';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material';

interface IEventCardProps {
    entry: IEvent;
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
        gridTemplateColumns: 'auto minmax(0, 1fr)',
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
}));

const StyledCodeSection = styled('div')(({ theme }) => ({
    backgroundColor: 'white',
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
        locationSettings.locale
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
            </dl>
            <ConditionallyRender
                condition={entry.data || entry.preData}
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
