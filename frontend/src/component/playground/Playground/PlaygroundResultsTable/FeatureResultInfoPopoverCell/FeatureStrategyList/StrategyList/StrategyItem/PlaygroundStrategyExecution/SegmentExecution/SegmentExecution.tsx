import type { FC } from 'react';
import type { PlaygroundSegmentSchema, PlaygroundRequestSchema } from 'openapi';
import { ConstraintExecution } from '../ConstraintExecution/ConstraintExecution.tsx';
import { SegmentItem } from 'component/common/SegmentItem/SegmentItem';
import { objectId } from 'utils/objectId';
import { ConstraintsList } from 'component/common/ConstraintsList/ConstraintsList';

type SegmentExecutionProps = {
    segment: PlaygroundSegmentSchema;
    input?: PlaygroundRequestSchema;
};

export const SegmentExecution: FC<SegmentExecutionProps> = ({
    segment,
    input,
}) => {
    const constraintList =
        segment.constraints.length > 0 ? (
            <ConstraintsList>
                {segment.constraints.map((constraint) => (
                    <ConstraintExecution
                        key={objectId(constraint)}
                        constraint={constraint}
                        input={input}
                    />
                ))}
            </ConstraintsList>
        ) : undefined;

    return (
        <SegmentItem
            segment={segment}
            constraintList={constraintList}
            isExpanded
        />
    );
};
