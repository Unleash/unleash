import { type ReactNode, useEffect, useState } from 'react';
import { Collapse, styled, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const StepContainer = styled('div')(({ theme }) => ({
    borderTop: `1px solid ${theme.palette.divider}`,
}));

const StepHeader = styled('button')(({ theme }) => ({
    all: 'unset',
    boxSizing: 'border-box',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5, 2),
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const StepIndicator = styled('span', {
    shouldForwardProp: (prop) => prop !== 'done',
})<{ done?: boolean }>(({ theme, done }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    flexShrink: 0,
    color: done ? theme.palette.success.main : theme.palette.text.secondary,
    '& svg': { fontSize: 20 },
}));

const DashedCircle = styled('span')(({ theme }) => ({
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: `1.5px dashed ${theme.palette.text.secondary}`,
}));

const StepTitle = styled(Typography, {
    shouldForwardProp: (prop) => prop !== 'done',
})<{ done?: boolean }>(({ theme, done }) => ({
    flexGrow: 1,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    color: done ? theme.palette.text.secondary : theme.palette.text.primary,
    textDecoration: done ? 'line-through' : 'none',
}));

const Chevron = styled(KeyboardArrowDownIcon, {
    shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded?: boolean }>(({ theme, expanded }) => ({
    color: theme.palette.text.secondary,
    transition: theme.transitions.create('transform'),
    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
}));

const StepBody = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    padding: theme.spacing(0, 2, 2, 6),
}));

const StepBodyText = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
}));

export interface ChecklistStep {
    key: string;
    title: string;
    body: string;
    done: boolean;
    action: ReactNode;
}

export const ChecklistSteps = ({ steps }: { steps: ChecklistStep[] }) => {
    const firstIncomplete = steps.findIndex((step) => !step.done);
    const [expanded, setExpanded] = useState(firstIncomplete);

    useEffect(() => {
        setExpanded(firstIncomplete);
    }, [firstIncomplete]);

    return (
        <div>
            {steps.map((step, index) => {
                const isExpanded = expanded === index;
                return (
                    <StepContainer key={step.key}>
                        <StepHeader
                            type='button'
                            onClick={() => setExpanded(isExpanded ? -1 : index)}
                            aria-expanded={isExpanded}
                        >
                            <StepIndicator done={step.done}>
                                {step.done ? (
                                    <CheckCircleIcon />
                                ) : (
                                    <DashedCircle />
                                )}
                            </StepIndicator>
                            <StepTitle done={step.done}>{step.title}</StepTitle>
                            <Chevron expanded={isExpanded} />
                        </StepHeader>
                        <Collapse in={isExpanded} unmountOnExit>
                            <StepBody>
                                <StepBodyText>{step.body}</StepBodyText>
                                <div>{step.action}</div>
                            </StepBody>
                        </Collapse>
                    </StepContainer>
                );
            })}
        </div>
    );
};
