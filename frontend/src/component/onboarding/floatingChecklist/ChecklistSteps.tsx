import { type ReactNode, useEffect, useState } from 'react';
import { Collapse, styled, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { focusOutline } from 'themes/themeStyles.ts';

const StepContainer = styled('div')(({ theme }) => ({
    borderTop: `1px solid ${theme.palette.divider}`,
    '&:last-child, &:last-child > button': {
        borderBottomLeftRadius: theme.shape.borderRadiusLarge,
        borderBottomRightRadius: theme.shape.borderRadiusLarge,
    },
}));

const Chevron = styled(KeyboardArrowDownIcon, {
    shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded?: boolean }>(({ theme, expanded }) => ({
    boxSizing: 'content-box',
    flexShrink: 0,
    fontSize: 20,
    padding: theme.spacing(0.625),
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.text.secondary,
    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
}));

const StepHeader = styled('button')(({ theme }) => ({
    all: 'unset',
    boxSizing: 'border-box',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1, 1.5),
    cursor: 'pointer',
    [`&:hover ${Chevron}`]: {
        backgroundColor: theme.palette.action.hover,
        color: theme.palette.text.primary,
    },
    '&:focus-visible': {
        ...focusOutline(theme),
        outlineOffset: -2,
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
    ...(done && {
        borderRadius: theme.shape.borderRadiusMedium,
        border: `1.25px solid ${theme.palette.success.border}`,
        backgroundColor: theme.palette.success.light,
    }),
    '& svg': { fontSize: done ? 14 : 20 },
}));

const DashedCircle = styled('span')(({ theme }) => ({
    width: 16,
    height: 16,
    flexShrink: 0,
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

const StepBody = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(0, 2, 3, 5.5),
}));

const StepBodyText = styled(Typography)(({ theme }) => ({
    ...theme.typography.body2,
    fontWeight: theme.typography.fontWeightRegular,
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
                                {step.done ? <CheckIcon /> : <DashedCircle />}
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
