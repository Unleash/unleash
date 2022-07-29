import {
    PlaygroundFeatureStrategyConstraintResult,
    SdkContextSchema,
} from 'hooks/api/actions/usePlayground/playground.model';
import React, { Fragment } from 'react';
import { objectId } from '../../../../../../utils/objectId';
import { ConditionallyRender } from '../../../../../common/ConditionallyRender/ConditionallyRender';
import { StrategySeparator } from '../../../../../common/StrategySeparator/StrategySeparator';
import { ConstraintAccordionView } from '../../../../../common/ConstraintAccordion/ConstraintAccordionView/ConstraintAccordionView';
import { styled } from '@mui/material';

interface PlaygroundResultConstraintExecutionProps {
    constraints?: PlaygroundFeatureStrategyConstraintResult[];
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
}: PlaygroundResultConstraintExecutionProps) => {
    // const context = usePlaygroundContext();
    const context: SdkContextSchema = {
        appName: 'MyApp',
        environment: '',
    };

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
                        playgroundContext={context}
                        maxLength={80}
                        sx={{
                            backgroundColor: 'transparent!important',
                        }}
                    />
                </Fragment>
            ))}
        </PlaygroundResultConstraintExecutionWrapper>
    );
};
