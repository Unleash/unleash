import { PlaygroundFeatureStrategyConstraintResult } from 'hooks/api/actions/usePlayground/playground.model';
import React, { Fragment } from 'react';
import { objectId } from '../../../../../../utils/objectId';
import { ConditionallyRender } from '../../../../../common/ConditionallyRender/ConditionallyRender';
import { StrategySeparator } from '../../../../../common/StrategySeparator/StrategySeparator';
import { ConstraintAccordionView } from '../../../../../common/ConstraintAccordion/ConstraintAccordionView/ConstraintAccordionView';

interface PlaygroundResultConstraintExecutionProps {
    constraints?: PlaygroundFeatureStrategyConstraintResult[];
}

export const PlaygroundResultConstraintExecution = ({
    constraints,
}: PlaygroundResultConstraintExecutionProps) => {
    if (!constraints) return null;

    return (
        <>
            {constraints?.map((constraint, index) => (
                <Fragment key={objectId(constraint)}>
                    <ConditionallyRender
                        condition={index > 0}
                        show={<StrategySeparator text="AND" />}
                    />
                    <ConstraintAccordionView
                        constraint={constraint}
                        sx={{
                            backgroundColor: 'transparent!important',
                        }}
                    />
                </Fragment>
            ))}
        </>
    );
};
