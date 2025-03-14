import type { FC } from 'react';
import type {
    PlaygroundConstraintSchema,
    PlaygroundRequestSchema,
} from 'openapi';
import { ConstraintItem } from 'component/common/ConstraintsList/ConstraintItem/ConstraintItem';
import CheckCircle from '@mui/icons-material/CheckCircle';
import { styled } from '@mui/material';
import Cancel from '@mui/icons-material/Cancel';

interface IConstraintExecutionProps {
    constraint?: PlaygroundConstraintSchema;
    input?: PlaygroundRequestSchema;
}

const StyledContainer = styled('div', {
    shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant: 'ok' | 'error' }>(({ theme, variant }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    color:
        variant === 'ok'
            ? theme.palette.success.dark
            : theme.palette.error.dark,

    fontSize: theme.typography.body2.fontSize,
    svg: {
        // todo: how best to size this?
        fontSize: `calc(${theme.typography.body1.fontSize} * 1.1)`,
    },
}));

const ConstraintOk = () => {
    return (
        <StyledContainer variant='ok'>
            <CheckCircle aria-hidden='true' />
            <p>Constraint met by value in context</p>
        </StyledContainer>
    );
};

export const ConstraintError = ({
    constraint,
    input,
}: {
    constraint: PlaygroundConstraintSchema;
    input?: PlaygroundRequestSchema;
}) => {
    const formatText = () => {
        const value = input?.context[constraint.contextName];

        if (value) {
            return `Constraint not met – the value in the context: { ${value} } is not ${constraint.operator} ${constraint.contextName}`;
        }

        return `Constraint not met – no value was specified for ${constraint.contextName}`;
    };

    return (
        <StyledContainer variant='error'>
            <Cancel aria-hidden='true' />
            <p>{formatText()}</p>
        </StyledContainer>
    );
};

export const ConstraintExecution: FC<IConstraintExecutionProps> = ({
    constraint,
    input,
}) => {
    if (!constraint) return null;

    return (
        <>
            <ConstraintItem {...constraint} />
            {constraint.result ? (
                <ConstraintOk />
            ) : (
                <ConstraintError input={input} constraint={constraint} />
            )}
        </>
    );
};
