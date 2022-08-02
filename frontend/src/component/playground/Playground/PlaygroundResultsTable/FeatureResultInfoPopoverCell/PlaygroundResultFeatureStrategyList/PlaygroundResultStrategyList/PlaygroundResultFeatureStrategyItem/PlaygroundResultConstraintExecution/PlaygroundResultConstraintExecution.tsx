import {
    PlaygroundFeatureStrategyConstraintResult,
    PlaygroundRequestSchema,
} from 'hooks/api/actions/usePlayground/playground.model';
import React, { Fragment } from 'react';
import { objectId } from '../../../../../../../../../utils/objectId';
import { ConditionallyRender } from '../../../../../../../../common/ConditionallyRender/ConditionallyRender';
import { StrategySeparator } from '../../../../../../../../common/StrategySeparator/StrategySeparator';
import { ConstraintAccordionView } from '../../../../../../../../common/ConstraintAccordion/ConstraintAccordionView/ConstraintAccordionView';
import { styled } from '@mui/material';

interface PlaygroundResultConstraintExecutionProps {
    constraints?: PlaygroundFeatureStrategyConstraintResult[];
    compact: boolean;
    input?: PlaygroundRequestSchema;
}

export const PlaygroundResultConstraintExecutionWrapper = styled('div')(
    ({ theme }) => ({
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
    })
);

export const PlaygroundResultConstraintExecution = ({
    constraints,
    compact,
    input,
}: PlaygroundResultConstraintExecutionProps) => {
    if (!constraints) return null;

    return (
        <PlaygroundResultConstraintExecutionWrapper>
            {constraints?.map((constraint, index) => (
                <Fragment key={objectId(constraint)}>
                    <ConditionallyRender
                        condition={index > 0}
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
        </PlaygroundResultConstraintExecutionWrapper>
    );
};
