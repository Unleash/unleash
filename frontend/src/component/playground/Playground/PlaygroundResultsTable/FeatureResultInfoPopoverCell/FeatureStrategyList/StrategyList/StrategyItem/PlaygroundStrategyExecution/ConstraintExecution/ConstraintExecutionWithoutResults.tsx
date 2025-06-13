import { type FC, Fragment } from 'react';
import type { PlaygroundConstraintSchema } from 'openapi';
import { objectId } from 'utils/objectId';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { styled } from '@mui/material';
import { ConstraintSeparator } from 'component/common/ConstraintsList/ConstraintSeparator/ConstraintSeparator';
import { ConstraintAccordionView } from 'component/common/NewConstraintAccordion/ConstraintAccordionView/ConstraintAccordionView';

interface IConstraintExecutionWithoutResultsProps {
    constraints?: PlaygroundConstraintSchema[];
}

export const ConstraintExecutionWrapper = styled('div')(() => ({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
}));

export const ConstraintExecutionWithoutResults: FC<
    IConstraintExecutionWithoutResultsProps
> = ({ constraints }) => {
    if (!constraints) return null;

    return (
        <ConstraintExecutionWrapper>
            {constraints?.map((constraint, index) => (
                <Fragment key={objectId(constraint)}>
                    <ConditionallyRender
                        condition={index > 0}
                        show={<ConstraintSeparator />}
                    />
                    <ConstraintAccordionView constraint={constraint} disabled />
                </Fragment>
            ))}
        </ConstraintExecutionWrapper>
    );
};
