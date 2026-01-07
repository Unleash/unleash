import { Alert, styled } from '@mui/material';
import type { IntegrationEvent } from 'interfaces/integrationEvent';
import { IntegrationEventsDetailsAccordion } from './IntegrationEventsDetailsAccordion.tsx';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import { Link } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const LazyReactJSONEditor = lazy(
    () => import('component/common/ReactJSONEditor/ReactJSONEditor'),
);

const StyledDetails = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
}));

const StyledAlert = styled(Alert)({
    fontSize: 'inherit',
    lineBreak: 'anywhere',
});

const StyledLink = styled(Link)(({ theme }) => ({
    marginLeft: theme.spacing(1),
}));

export const IntegrationEventsDetails = ({
    state,
    stateDetails,
    event,
    details,
}: IntegrationEvent) => {
    const severity =
        state === 'failed'
            ? 'error'
            : state === 'success'
              ? 'success'
              : 'warning';

    const icon = state === 'success' ? <CheckCircleOutline /> : undefined;

    return (
        <StyledDetails>
            <StyledAlert severity={severity} icon={icon}>
                {stateDetails}
            </StyledAlert>
            <IntegrationEventsDetailsAccordion
                header={
                    <>
                        Event:
                        <StyledLink to='/history'>{event.type}</StyledLink>
                    </>
                }
            >
                <Suspense fallback={null}>
                    <LazyReactJSONEditor
                        content={{ json: event }}
                        readOnly
                        statusBar={false}
                        editorStyle='sidePanel'
                    />
                </Suspense>
            </IntegrationEventsDetailsAccordion>
            <Suspense fallback={null}>
                <LazyReactJSONEditor
                    content={{ json: details }}
                    readOnly
                    statusBar={false}
                    editorStyle='sidePanel'
                />
            </Suspense>
        </StyledDetails>
    );
};
