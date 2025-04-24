import type { FC } from 'react';
import type {
    PlaygroundConstraintSchema,
    PlaygroundRequestSchema,
} from 'openapi';
import { ConstraintItemHeader } from 'component/common/ConstraintsList/ConstraintItemHeader/ConstraintItemHeader';
import CheckCircle from '@mui/icons-material/CheckCircle';
import { styled } from '@mui/material';
import Cancel from '@mui/icons-material/Cancel';
import { ConstraintListItem } from 'component/common/ConstraintsList/ConstraintsList';

interface IConstraintExecutionProps {
    constraint?: PlaygroundConstraintSchema;
    input?: PlaygroundRequestSchema;
}

const StyledContainer = styled('div', {
    shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant: 'ok' | 'error' }>(({ theme, variant }) => ({
    '--font-size': theme.typography.body2.fontSize,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(0.5, 0.25),
    color:
        variant === 'ok'
            ? theme.palette.success.dark
            : theme.palette.error.dark,

    fontSize: 'var(--font-size)',
    svg: {
        fontSize: `calc(var(--font-size) * 1.25)`,
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

export const ConstraintError = ({ text }: { text: string }) => {
    return (
        <StyledContainer variant='error'>
            <Cancel aria-hidden='true' />
            <p>{text}</p>
        </StyledContainer>
    );
};

export const ConstraintExecution: FC<IConstraintExecutionProps> = ({
    constraint,
    input,
}) => {
    if (!constraint) return null;

    const errorText = () => {
        const value = input?.context[constraint.contextName];

        if (value) {
            return `Constraint not met – the value in the context: { ${value} } is not ${constraint.operator} ${constraint.contextName}`;
        }

        return `Constraint not met – no value was specified for ${constraint.contextName}`;
    };

    return (
        <ConstraintListItem>
            <div>
                <ConstraintItemHeader {...constraint} />
                {constraint.result ? (
                    <ConstraintOk />
                ) : (
                    <ConstraintError text={errorText()} />
                )}
            </div>
        </ConstraintListItem>
    );
};
