import ArrowForwardIosSharp from '@mui/icons-material/ArrowForwardIosSharp';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    IconButton,
    styled,
} from '@mui/material';
import { Suspense, lazy } from 'react';

const LazyReactJSONEditor = lazy(
    () => import('component/common/ReactJSONEditor/ReactJSONEditor'),
);

const StyledNoSignalsSpan = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(-0.75),
    height: theme.spacing(3),
}));

const StyledAccordion = styled(Accordion)({
    backgroundColor: 'transparent',
    boxShadow: 'none',
    '&:before': {
        display: 'none',
    },
});

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    lineHeight: '1.5rem',
    padding: 0,
    marginBottom: theme.spacing(-2.25),
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.primary.main,
    flexDirection: 'row-reverse',
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
        transform: 'rotate(90deg)',
    },
}));

const StyledArrowForwardIosSharp = styled(ArrowForwardIosSharp)(
    ({ theme }) => ({
        color: theme.palette.primary.main,
        fontSize: theme.fontSizes.smallBody,
    }),
);

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
    marginTop: theme.spacing(2),
    padding: 0,
}));

interface IProjectActionsPreviewPayloadProps {
    payload?: unknown;
}

export const ProjectActionsPreviewPayload = ({
    payload,
}: IProjectActionsPreviewPayloadProps) => {
    if (!payload) {
        return (
            <StyledNoSignalsSpan>
                No signals were received from this source yet.
            </StyledNoSignalsSpan>
        );
    }

    return (
        <StyledAccordion>
            <StyledAccordionSummary
                expandIcon={
                    <IconButton>
                        <StyledArrowForwardIosSharp titleAccess='Toggle' />
                    </IconButton>
                }
            >
                Preview payload
            </StyledAccordionSummary>
            <StyledAccordionDetails>
                <Suspense fallback={null}>
                    <LazyReactJSONEditor
                        content={{ json: payload }}
                        readOnly
                        statusBar={false}
                        editorStyle='sidePanel'
                    />
                </Suspense>
            </StyledAccordionDetails>
        </StyledAccordion>
    );
};
