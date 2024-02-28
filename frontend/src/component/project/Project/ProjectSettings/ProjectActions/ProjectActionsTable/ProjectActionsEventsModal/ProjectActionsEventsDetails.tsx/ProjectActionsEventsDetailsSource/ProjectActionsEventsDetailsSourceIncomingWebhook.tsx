import { ExpandMore } from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    IconButton,
    styled,
} from '@mui/material';
import { useIncomingWebhooks } from 'hooks/api/getters/useIncomingWebhooks/useIncomingWebhooks';
import { IObservableEvent } from 'interfaces/action';
import { Suspense, lazy, useMemo } from 'react';
import { Link } from 'react-router-dom';

const LazyReactJSONEditor = lazy(
    () => import('component/common/ReactJSONEditor/ReactJSONEditor'),
);

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    '&:before': {
        display: 'none',
    },
}));

const StyledLink = styled(Link)(({ theme }) => ({
    marginLeft: theme.spacing(1),
}));

interface IProjectActionsEventsDetailsSourceIncomingWebhookProps {
    observableEvent: IObservableEvent;
}

export const ProjectActionsEventsDetailsSourceIncomingWebhook = ({
    observableEvent,
}: IProjectActionsEventsDetailsSourceIncomingWebhookProps) => {
    const { incomingWebhooks } = useIncomingWebhooks();

    const incomingWebhookName = useMemo(() => {
        const incomingWebhook = incomingWebhooks.find(
            (incomingWebhook) =>
                incomingWebhook.id === observableEvent.sourceId,
        );

        return incomingWebhook?.name;
    }, [incomingWebhooks, observableEvent.sourceId]);

    return (
        <StyledAccordion>
            <AccordionSummary
                expandIcon={
                    <IconButton>
                        <ExpandMore titleAccess='Toggle' />
                    </IconButton>
                }
            >
                Incoming webhook:
                <StyledLink to='/integrations/incoming-webhooks'>
                    {incomingWebhookName}
                </StyledLink>
            </AccordionSummary>
            <AccordionDetails>
                <Suspense fallback={null}>
                    <LazyReactJSONEditor
                        content={{ json: observableEvent.payload }}
                        readOnly
                        statusBar={false}
                        editorStyle='sidePanel'
                    />
                </Suspense>
            </AccordionDetails>
        </StyledAccordion>
    );
};
