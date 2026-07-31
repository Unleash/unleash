import { type ReactNode, useEffect, useState } from 'react';
import { Button, Collapse, styled, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Link } from 'react-router';
import type { ChecklistStepKey } from './useChecklistContextValue.ts';

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

interface ChecklistStep {
    key: ChecklistStepKey;
    title: string;
    body: string;
    done: boolean;
    action: ReactNode;
}

interface IChecklistStepsProps {
    visibleSteps: ChecklistStepKey[];
    done: Record<ChecklistStepKey, boolean>;
    goToFlagHref: string | null;
    onTakeTour: () => void;
    onCreateFlag: () => void;
    onConnectSdk: () => void;
}

const ActionButton = ({
    label,
    onClick,
    disabled,
    done,
}: {
    label: string;
    onClick: () => void;
    disabled: boolean;
    done: boolean;
}) =>
    done ? (
        <Button
            variant='outlined'
            color='inherit'
            size='small'
            disabled
            startIcon={<CheckIcon />}
        >
            Done
        </Button>
    ) : (
        <Button
            variant='contained'
            color='primary'
            size='small'
            onClick={onClick}
            disabled={disabled}
        >
            {label}
        </Button>
    );

type GoToFlagButtonProps =
    | { variant: 'disabled' }
    | { variant: 'active'; goToFlagHref: string }
    | { variant: 'completed'; goToFlagHref: string };

const GoToFlagButton = (props: GoToFlagButtonProps) => {
    if (props.variant === 'disabled') {
        return (
            <Button variant='contained' color='primary' size='small' disabled>
                Go to flag
            </Button>
        );
    }
    return (
        <Button
            variant={props.variant === 'completed' ? 'outlined' : 'contained'}
            color='primary'
            size='small'
            component={Link}
            to={props.goToFlagHref}
        >
            Go to flag
        </Button>
    );
};

export const ChecklistSteps = ({
    visibleSteps,
    done,
    goToFlagHref,
    onTakeTour,
    onCreateFlag,
    onConnectSdk,
}: IChecklistStepsProps) => {
    // Any "Go to flag" affordance needs a real flag target. Server state
    // (`first-flag-created`, `sdk-connected`, `onboarded`) is one-way, so
    // `done.flag` can stay true after the user's only flag is deleted;
    // fall back to disabled instead of linking to the project page.
    const stepDefinitions: Record<ChecklistStepKey, ChecklistStep> = {
        tour: {
            key: 'tour',
            title: 'Unleash Intro',
            body: 'Learn the key concepts of rolling out a flag in Unleash.',
            done: done.tour,
            action: (
                <ActionButton
                    label='Take the tour'
                    onClick={onTakeTour}
                    disabled={false}
                    done={done.tour}
                />
            ),
        },
        flag: {
            key: 'flag',
            title: 'Create a feature flag',
            body: 'You must create a feature flag before you can connect a SDK.',
            done: done.flag,
            action:
                done.flag && goToFlagHref ? (
                    <GoToFlagButton
                        variant='completed'
                        goToFlagHref={goToFlagHref}
                    />
                ) : (
                    <ActionButton
                        label='New feature flag'
                        onClick={onCreateFlag}
                        disabled={false}
                        done={done.flag}
                    />
                ),
        },
        sdk: {
            key: 'sdk',
            title: done.sdk ? 'Connect SDK' : 'Connect SDKs',
            body: done.sdk
                ? 'You can connect as many SDKs as you need.'
                : 'To start using your feature flag, connect an SDK to the project.',
            done: done.sdk,
            action: (
                <ActionButton
                    label='Connect SDK'
                    onClick={onConnectSdk}
                    disabled={!done.flag}
                    done={done.sdk}
                />
            ),
        },
        on: {
            key: 'on',
            title: 'Turn flag on',
            body: 'Check that the flag is working by turning it on.',
            done: done.on,
            action:
                done.on && goToFlagHref ? (
                    <GoToFlagButton
                        variant='completed'
                        goToFlagHref={goToFlagHref}
                    />
                ) : done.sdk && goToFlagHref ? (
                    <GoToFlagButton
                        variant='active'
                        goToFlagHref={goToFlagHref}
                    />
                ) : (
                    <GoToFlagButton variant='disabled' />
                ),
        },
    };
    const steps: ChecklistStep[] = visibleSteps.map(
        (key) => stepDefinitions[key],
    );

    const firstIncomplete = steps.findIndex((step) => !step.done);
    const [expanded, setExpanded] = useState(firstIncomplete);

    // Auto-advance: whenever the set of completed steps changes, jump the
    // open accordion to the first step that still needs doing.
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
