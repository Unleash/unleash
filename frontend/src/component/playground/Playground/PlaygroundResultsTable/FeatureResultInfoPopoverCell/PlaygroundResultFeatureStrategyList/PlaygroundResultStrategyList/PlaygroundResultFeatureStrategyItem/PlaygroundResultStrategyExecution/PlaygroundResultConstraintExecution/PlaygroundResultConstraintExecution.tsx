import {
    PlaygroundConstraintSchema,
    PlaygroundRequestSchema,
} from 'hooks/api/actions/usePlayground/playground.model';
import React, { Fragment } from 'react';
import { objectId } from '../../../../../../../../../../utils/objectId';
import { ConditionallyRender } from '../../../../../../../../../common/ConditionallyRender/ConditionallyRender';
import { StrategySeparator } from '../../../../../../../../../common/StrategySeparator/StrategySeparator';
import { styled } from '@mui/material';
import { PlaygroundResultConstraintAccordionView } from './PlaygroundResultConstraintAccordion/PlaygroundResultConstraintAccordionView/PlaygroundResultConstraintAccordionView';

interface PlaygroundResultConstraintExecutionProps {
    constraints?: PlaygroundConstraintSchema[];
    compact: boolean;
    input?: PlaygroundRequestSchema;
}

export const PlaygroundResultConstraintExecutionWrapper = styled('div')(() => ({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
}));

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
                        condition={index > 0 && constraints?.length > 1}
                        show={<StrategySeparator text="AND" />}
                    />
                    <PlaygroundResultConstraintAccordionView
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
