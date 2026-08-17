import { Fragment } from 'react';
import { Box, styled } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export interface IntroStepperStep {
    label: string;
    clickable: boolean;
}

interface IIntroStepperProps {
    steps: IntroStepperStep[];
    activeIndex: number;
    onStepClick: (index: number) => void;
}

const StyledStepper = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5),
}));

const StyledStep = styled('button', {
    shouldForwardProp: (prop) => prop !== 'clickable',
})<{ clickable: boolean }>(({ theme, clickable }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    padding: 0,
    border: 'none',
    background: 'none',
    font: 'inherit',
    cursor: clickable ? 'pointer' : 'default',
}));

const StyledBullet = styled('span', {
    shouldForwardProp: (prop) => prop !== 'state',
})<{ state: 'done' | 'current' | 'upcoming' }>(({ theme, state }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
    borderRadius: '50%',
    boxSizing: 'border-box',
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.typography.fontWeightMedium,
    lineHeight: 1,
    transition: 'all 0.15s ease',
    ...(state === 'upcoming'
        ? {
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.neutral.border}`,
              color: theme.palette.text.secondary,
          }
        : {
              background: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
          }),
    '& svg': {
        fontSize: theme.spacing(1.5),
    },
}));

const StyledLabel = styled('span', {
    shouldForwardProp: (prop) => prop !== 'state',
})<{ state: 'done' | 'current' | 'upcoming' }>(({ theme, state }) => ({
    whiteSpace: 'nowrap',
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.typography.fontWeightMedium,
    color:
        state === 'current'
            ? theme.palette.text.primary
            : state === 'done'
              ? theme.palette.text.secondary
              : theme.palette.text.disabled,
}));

const StyledChevron = styled(ChevronRightIcon)(({ theme }) => ({
    color: theme.palette.neutral.border,
    fontSize: theme.spacing(2),
    flexShrink: 0,
}));

export const IntroStepper = ({
    steps,
    activeIndex,
    onStepClick,
}: IIntroStepperProps) => (
    <StyledStepper data-testid='QUICK_TOUR_INTRO_STEPPER'>
        {steps.map((step, index) => {
            const state =
                index < activeIndex
                    ? 'done'
                    : index === activeIndex
                      ? 'current'
                      : 'upcoming';
            return (
                <Fragment key={step.label}>
                    {index > 0 ? <StyledChevron /> : null}
                    <StyledStep
                        type='button'
                        clickable={step.clickable}
                        aria-disabled={!step.clickable}
                        onClick={() => step.clickable && onStepClick(index)}
                        aria-current={state === 'current' ? 'step' : undefined}
                    >
                        <StyledBullet state={state}>
                            {state === 'done' ? (
                                <CheckIcon />
                            ) : (
                                <span>{index + 1}</span>
                            )}
                        </StyledBullet>
                        <StyledLabel state={state}>{step.label}</StyledLabel>
                    </StyledStep>
                </Fragment>
            );
        })}
    </StyledStepper>
);
