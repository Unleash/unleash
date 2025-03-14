import type { FC } from 'react';
import type {
    PlaygroundConstraintSchema,
    PlaygroundRequestSchema,
} from 'openapi';
import { ConstraintError } from './ConstraintError/ConstraintError';
import { ConstraintOk } from './ConstraintOk/LegacyConstraintOk';
import { ConstraintItem } from 'component/common/ConstraintsList/ConstraintItem/ConstraintItem';

interface IConstraintExecutionProps {
    constraint?: PlaygroundConstraintSchema;
    input?: PlaygroundRequestSchema;
}

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
