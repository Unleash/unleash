import BoltIcon from '@mui/icons-material/Bolt';
import { styled } from '@mui/material';
import type { TransitionConditionSchema } from 'openapi';
import type { ReactNode } from 'react';

const StyledTransitionRowContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    justifyContent: 'space-between',
    width: '100%',
}));

const StyledTransitionContentGroup = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    [theme.breakpoints.down(600)]: {
        flexWrap: 'wrap',
    },
}));

const StyledTransitionIcon = styled(BoltIcon, {
    shouldForwardProp: (prop) => prop !== 'muted',
})<{ muted?: boolean }>(({ theme, muted }) => ({
    color: theme.palette.common.white,
    fontSize: 18,
    flexShrink: 0,
    backgroundColor: muted
        ? theme.palette.neutral.border
        : theme.palette.primary.main,
    borderRadius: '50%',
    padding: theme.spacing(0.25),
}));

const StyledTransitionLabel = styled('span', {
    shouldForwardProp: (prop) => prop !== 'muted',
})<{ muted?: boolean }>(({ theme, muted }) => ({
    color: muted ? theme.palette.text.secondary : theme.palette.text.primary,
    fontSize: theme.typography.body2.fontSize,
    flexShrink: 0,
}));

const getConditionText = (type: TransitionConditionSchema['type']) =>
    type === 'exposure' ? 'since feature creation' : 'from milestone start';

interface TransitionConditionRowProps {
    condition: ReactNode;
    type?: TransitionConditionSchema['type'];
    label?: string;
    muted?: boolean;
    endActions?: ReactNode;
}

export const TransitionConditionRow = ({
    condition,
    type = 'time',
    label = 'Proceed after',
    muted,
    endActions,
}: TransitionConditionRowProps) => {
    const conditionText = getConditionText(type);

    return (
        <StyledTransitionRowContainer>
            <StyledTransitionContentGroup>
                <StyledTransitionIcon muted={muted} />
                <StyledTransitionLabel muted={muted}>
                    {label}
                </StyledTransitionLabel>
                {condition}
                <StyledTransitionLabel muted={muted}>
                    {conditionText}
                </StyledTransitionLabel>
            </StyledTransitionContentGroup>
            {endActions}
        </StyledTransitionRowContainer>
    );
};

interface ReadonlyTransitionConditionRowProps {
    value: string;
    type?: TransitionConditionSchema['type'];
    label: string;
    muted?: boolean;
}

export const ReadonlyTransitionConditionRow = ({
    value,
    type = 'time',
    label,
    muted,
}: ReadonlyTransitionConditionRowProps) => (
    <StyledTransitionRowContainer>
        <StyledTransitionContentGroup>
            <StyledTransitionIcon muted={muted} />
            <StyledTransitionLabel muted={muted}>
                {label} {value} {getConditionText(type)}
            </StyledTransitionLabel>
        </StyledTransitionContentGroup>
    </StyledTransitionRowContainer>
);
