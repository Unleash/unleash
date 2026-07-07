import { type ReactNode, useEffect, useState } from 'react';
import { Button, Collapse, styled, Typography } from '@mui/material';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import CodeIcon from '@mui/icons-material/Code';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import { Link } from 'react-router';

const ProgressHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(2, 2, 1, 2),
}));

const ProgressTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
}));

const ProgressBadge = styled('span')(({ theme }) => ({
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.secondary.contrastText,
    backgroundColor: theme.palette.secondary.light,
    border: `1px solid ${theme.palette.secondary.border}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.25, 1),
}));

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

const StepIcon = styled('span', {
    shouldForwardProp: (prop) => prop !== 'done',
})<{ done?: boolean }>(({ theme, done }) => ({
    display: 'flex',
    color: done ? theme.palette.success.main : theme.palette.text.secondary,
    '& svg': { fontSize: 20 },
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

export interface SetupStep {
    key: string;
    title: string;
    body: string;
    icon: ReactNode;
    done: boolean;
    enabled: boolean;
    /** Action rendered inside the expanded body. */
    action: ReactNode;
}

interface ISetupGuideProps {
    projectId?: string;
    done: { project: boolean; flag: boolean; sdk: boolean; on: boolean };
    goToFlagHref: string;
    onCreateProject: () => void;
    onCreateFlag: () => void;
    onConnectSdk: () => void;
    onGoToFlag: () => void;
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
        <Button variant='outlined' color='inherit' size='small' disabled>
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

export const SetupGuide = ({
    done,
    goToFlagHref,
    onCreateProject,
    onCreateFlag,
    onConnectSdk,
    onGoToFlag,
}: ISetupGuideProps) => {
    const steps: SetupStep[] = [
        {
            key: 'project',
            title: 'Create a project',
            body: 'The first thing you must do is to create a project.',
            icon: <CreateNewFolderOutlinedIcon />,
            done: done.project,
            enabled: true,
            action: (
                <ActionButton
                    label='New project'
                    onClick={onCreateProject}
                    disabled={false}
                    done={done.project}
                />
            ),
        },
        {
            key: 'flag',
            title: 'Create a feature flag',
            body: 'You must create a feature flag before you can connect an SDK.',
            icon: <OutlinedFlagIcon />,
            done: done.flag,
            enabled: done.project,
            action: (
                <ActionButton
                    label='New feature flag'
                    onClick={onCreateFlag}
                    disabled={!done.project}
                    done={done.flag}
                />
            ),
        },
        {
            key: 'sdk',
            title: 'Connect SDK and wrap your code',
            body: 'To start using your feature flag, connect an SDK to the project.',
            icon: <CodeIcon />,
            done: done.sdk,
            enabled: done.flag,
            action: (
                <ActionButton
                    label='Connect SDK'
                    onClick={onConnectSdk}
                    disabled={!done.flag}
                    done={done.sdk}
                />
            ),
        },
        {
            key: 'on',
            title: 'Turn flag on/off',
            body: 'Check that the flag is working by turning it on.',
            icon: <ToggleOnIcon />,
            done: done.on,
            enabled: done.sdk,
            action: done.on ? (
                <Button
                    variant='outlined'
                    color='inherit'
                    size='small'
                    disabled
                >
                    Done
                </Button>
            ) : done.sdk ? (
                <Button
                    variant='contained'
                    color='primary'
                    size='small'
                    component={Link}
                    to={goToFlagHref}
                    onClick={onGoToFlag}
                >
                    Go to flag
                </Button>
            ) : (
                <Button
                    variant='contained'
                    color='primary'
                    size='small'
                    disabled
                >
                    Go to flag
                </Button>
            ),
        },
    ];

    const completedCount = steps.filter((step) => step.done).length;
    const firstIncomplete = steps.findIndex((step) => !step.done);

    const [expanded, setExpanded] = useState(firstIncomplete);

    // Auto-advance: whenever the set of completed steps changes, jump the
    // open accordion to the first step that still needs doing.
    useEffect(() => {
        setExpanded(firstIncomplete);
    }, [firstIncomplete]);

    return (
        <div>
            <ProgressHeader>
                <ProgressTitle>Set up your own project</ProgressTitle>
                <ProgressBadge>
                    {completedCount}/{steps.length} Completed
                </ProgressBadge>
            </ProgressHeader>

            {steps.map((step, index) => {
                const isExpanded = expanded === index;
                return (
                    <StepContainer key={step.key}>
                        <StepHeader
                            type='button'
                            onClick={() => setExpanded(isExpanded ? -1 : index)}
                            aria-expanded={isExpanded}
                        >
                            <StepIcon done={step.done}>
                                {step.done ? (
                                    <CheckCircleIcon />
                                ) : (
                                    <RadioButtonUncheckedIcon />
                                )}
                            </StepIcon>
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
