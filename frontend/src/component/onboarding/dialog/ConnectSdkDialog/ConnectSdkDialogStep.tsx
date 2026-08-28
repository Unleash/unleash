import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    styled,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import type { ReactNode } from 'react';
import { Badge } from 'component/common/Badge/Badge';

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: `${theme.shape.borderRadiusLarge}px !important`,
    '&:before': {
        display: 'none',
    },
    '&.Mui-disabled': {
        backgroundColor: theme.palette.background.paper,
    },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    gap: theme.spacing(1.5),
    fontWeight: theme.typography.fontWeightBold,
    '& .MuiAccordionSummary-content': {
        alignItems: 'center',
        gap: theme.spacing(1.5),
    },
    '&.Mui-disabled': {
        opacity: 1,
        '& .MuiAccordionSummary-expandIconWrapper': {
            opacity: 0.5,
        },
    },
}));

const StyledCompletedBadge = styled(Badge)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.success.main,
    color: 'white',
    border: `1px solid ${theme.palette.success.main}`,
    '& svg': {
        width: theme.spacing(2.5),
        height: theme.spacing(2.5),
    },
}));

const StyledSummary = styled(Box)({
    marginLeft: 'auto',
});

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
    borderTop: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
    paddingLeft: theme.spacing(6.5),
}));

interface ConnectSdkDialogStepProps {
    stepNumber: number;
    title: string;
    isExpanded: boolean;
    isCompleted: boolean;
    isDisabled: boolean;
    onExpand: () => void;
    summary?: ReactNode;
    children: ReactNode;
}

export const ConnectSdkDialogStep = ({
    stepNumber,
    title,
    isExpanded,
    isCompleted,
    isDisabled,
    onExpand,
    summary,
    children,
}: ConnectSdkDialogStepProps) => {
    return (
        <StyledAccordion
            expanded={isExpanded}
            disabled={isDisabled}
            onChange={onExpand}
        >
            <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                {isCompleted ? (
                    <StyledCompletedBadge round>
                        <CheckIcon />
                    </StyledCompletedBadge>
                ) : (
                    <Badge color={isExpanded ? 'primary' : 'neutral'} round>
                        {stepNumber}
                    </Badge>
                )}
                {title}
                {summary && <StyledSummary>{summary}</StyledSummary>}
            </StyledAccordionSummary>
            <StyledAccordionDetails>{children}</StyledAccordionDetails>
        </StyledAccordion>
    );
};
