import ExpandMore from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    IconButton,
    styled,
} from '@mui/material';
import { useSignalEndpoints } from 'hooks/api/getters/useSignalEndpoints/useSignalEndpoints';
import type { ISignal } from 'interfaces/signal';
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

const StyledAccordionSummary = styled(AccordionSummary)({
    lineHeight: '1.5rem',
});

const StyledLink = styled(Link)(({ theme }) => ({
    marginLeft: theme.spacing(1),
}));

interface IProjectActionsEventsDetailsSourceSignalEndpointProps {
    signal: ISignal;
}

export const ProjectActionsEventsDetailsSourceSignalEndpoint = ({
    signal,
}: IProjectActionsEventsDetailsSourceSignalEndpointProps) => {
    const { signalEndpoints } = useSignalEndpoints();

    const signalEndpointName = useMemo(() => {
        const signalEndpoint = signalEndpoints.find(
            ({ id }) => id === signal.sourceId,
        );

        return signalEndpoint?.name;
    }, [signalEndpoints, signal.sourceId]);

    return (
        <StyledAccordion>
            <StyledAccordionSummary
                expandIcon={
                    <IconButton>
                        <ExpandMore titleAccess='Toggle' />
                    </IconButton>
                }
            >
                Signal endpoint:
                <StyledLink to='/integrations/signals'>
                    {signalEndpointName}
                </StyledLink>
            </StyledAccordionSummary>
            <AccordionDetails>
                <Suspense fallback={null}>
                    <LazyReactJSONEditor
                        content={{ json: signal.payload }}
                        readOnly
                        statusBar={false}
                        editorStyle='sidePanel'
                    />
                </Suspense>
            </AccordionDetails>
        </StyledAccordion>
    );
};
