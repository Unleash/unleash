import { Fragment, type VFC } from 'react';
import type { PlaygroundSegmentSchema } from 'openapi';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ConstraintExecutionWithoutResults } from '../ConstraintExecution/ConstraintExecutionWithoutResults.tsx';
import { SegmentItem } from 'component/common/SegmentItem/SegmentItem.tsx';
import { ConstraintSeparator } from 'component/common/ConstraintsList/ConstraintSeparator/ConstraintSeparator.tsx';

interface ISegmentExecutionWithoutResultProps {
    segments?: PlaygroundSegmentSchema[];
}

export const SegmentExecutionWithoutResult: VFC<
    ISegmentExecutionWithoutResultProps
> = ({ segments }) => {
    if (!segments) return null;

    return (
        <>
            {segments.map((segment, index) => (
                <Fragment key={segment.id}>
                    <SegmentItem
                        segment={segment}
                        constraintList={
                            <ConstraintExecutionWithoutResults
                                constraints={segment.constraints}
                            />
                        }
                        isExpanded
                        disabled
                    />
                    <ConditionallyRender
                        condition={
                            // Add IF there is a next segment
                            index >= 0 &&
                            segments.length > 1 &&
                            // Don't add if it's the last segment item
                            index !== segments.length - 1
                        }
                        show={<ConstraintSeparator />}
                    />
                </Fragment>
            ))}
        </>
    );
};
