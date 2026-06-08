import { styled, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import type { ReactNode } from 'react';

export type StepState = 'disabled' | 'active' | 'done';

interface IStepLayoutProps {
    stepNumber: number;
    state: StepState;
    icon: ReactNode;
    title: string;
    body: string;
    children: ReactNode;
}

export const ActionBox = styled('div', {
    shouldForwardProp: (prop) => prop !== 'disabled',
})<{ disabled?: boolean }>(({ theme, disabled }) => ({
    flexBasis: '50%',
    display: 'flex',
    gap: theme.spacing(1),
    flexDirection: 'column',
    borderRight: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2, 3, 3, 3),
    ...(disabled && {
        background: theme.palette.background.elevation2,
    }),
    [theme.breakpoints.down('md')]: {
        borderRight: 0,
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    '&:last-child': {
        borderWidth: 0,
    },
}));

const Header = styled('div')(() => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    minHeight: 32,
}));

const IconBadge = styled('div')(() => ({
    width: 32,
    height: 32,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& svg': { fontSize: 20 },
    '& svg path': { fill: 'currentColor' },
}));

const ActiveIcon = styled(IconBadge)(({ theme }) => ({
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
}));

const DoneIcon = styled(IconBadge)(({ theme }) => ({
    backgroundColor: theme.palette.success.light,
    border: `1px solid ${theme.palette.success.border}`,
    color: theme.palette.success.main,
}));

const DisabledIcon = styled(IconBadge)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.elevation1,
    color: theme.palette.text.secondary,
}));

const StepLabel = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: theme.spacing(2),
    color: theme.palette.text.secondary,
}));

const Content = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    gap: theme.spacing(1),
}));

const Copy = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const Title = styled(Typography, {
    shouldForwardProp: (prop) => prop !== 'done',
})<{ done?: boolean }>(({ theme, done }) => ({
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    color: done ? theme.palette.text.secondary : theme.palette.text.primary,
    textDecoration: done ? 'line-through' : 'none',
}));

const Body = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
}));

const ButtonRow = styled('div')(() => ({
    display: 'flex',
    alignSelf: 'flex-start',
    marginTop: 'auto',
}));

const stepIcon = (state: StepState, icon: ReactNode) => {
    if (state === 'done')
        return (
            <DoneIcon>
                <CheckIcon />
            </DoneIcon>
        );
    if (state === 'disabled') return <DisabledIcon>{icon}</DisabledIcon>;
    return <ActiveIcon>{icon}</ActiveIcon>;
};

export const StepLayout = ({
    stepNumber,
    state,
    icon,
    title,
    body,
    children,
}: IStepLayoutProps) => {
    const isDone = state === 'done';

    return (
        <ActionBox disabled={state === 'disabled'}>
            <Header>
                {stepIcon(state, icon)}
                <StepLabel>Step {stepNumber}</StepLabel>
            </Header>
            <Content>
                <Copy>
                    <Title done={isDone}>{title}</Title>
                    <Body>{body}</Body>
                </Copy>
                <ButtonRow>{children}</ButtonRow>
            </Content>
        </ActionBox>
    );
};
