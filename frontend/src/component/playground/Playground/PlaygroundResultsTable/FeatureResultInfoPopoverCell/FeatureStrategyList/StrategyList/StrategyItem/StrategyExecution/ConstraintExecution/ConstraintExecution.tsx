import { Fragment, VFC } from 'react';
import {
    PlaygroundConstraintSchema,
    PlaygroundRequestSchema,
} from 'component/playground/Playground/interfaces/playground.model';
import { objectId } from 'utils/objectId';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import { styled } from '@mui/material';
import { ConstraintAccordionView } from './ConstraintAccordion/ConstraintAccordionView/ConstraintAccordionView';

interface IConstraintExecutionProps {
    constraints?: PlaygroundConstraintSchema[];
    compact: boolean;
    input?: PlaygroundRequestSchema;
}

export const ConstraintExecutionWrapper = styled('div')(() => ({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
}));

export const ConstraintExecution: VFC<IConstraintExecutionProps> = ({
    constraints,
    compact,
    input,
}) => {
    if (!constraints) return null;

    return (
        <ConstraintExecutionWrapper>
            {constraints?.map((constraint, index) => (
                <Fragment key={objectId(constraint)}>
                    <ConditionallyRender
                        condition={index > 0 && constraints?.length > 1}
                        show={<StrategySeparator text="AND" />}
                    />
                    <ConstraintAccordionView
                        constraint={constraint}
                        playgroundInput={input}
                        maxLength={compact ? 25 : 50}
                        sx={{
                            backgroundColor: 'transparent!important',
                        }}
                    />
                </Fragment>
            ))}
        </ConstraintExecutionWrapper>
    );
};
