import React, { Fragment, useState } from 'react';
import { ISegment } from 'interfaces/segment';
import { useStyles } from 'component/feature/FeatureStrategy/FeatureStrategySegment/FeatureStrategySegmentList.styles';
import ConditionallyRender from 'component/common/ConditionallyRender';
import { FeatureStrategySegmentChip } from 'component/feature/FeatureStrategy/FeatureStrategySegment/FeatureStrategySegmentChip';
import { ConstraintAccordionList } from 'component/common/ConstraintAccordion/ConstraintAccordionList/ConstraintAccordionList';

interface IFeatureStrategySegmentListProps {
    segments: ISegment[];
    setSegments: React.Dispatch<React.SetStateAction<ISegment[]>>;
}

export const FeatureStrategySegmentList = ({
    segments,
    setSegments,
}: IFeatureStrategySegmentListProps) => {
    const styles = useStyles();
    const [preview, setPreview] = useState<ISegment>();
    const lastSegmentIndex = segments.length - 1;

    if (segments.length === 0) {
        return null;
    }

    return (
        <>
            <div className={styles.list}>
                {segments.map((segment, i) => (
                    <Fragment key={segment.id}>
                        <FeatureStrategySegmentChip
                            segment={segment}
                            setSegments={setSegments}
                            preview={preview}
                            setPreview={setPreview}
                        />
                        <ConditionallyRender
                            condition={i < lastSegmentIndex}
                            show={<span className={styles.and}>AND</span>}
                        />
                    </Fragment>
                ))}
            </div>
            <ConditionallyRender
                condition={Boolean(preview && preview.constraints.length === 0)}
                show={() => <p>This segment has no constraints.</p>}
            />
            <ConditionallyRender
                condition={Boolean(preview)}
                show={() => (
                    <ConstraintAccordionList
                        constraints={preview!.constraints}
                    />
                )}
            />
        </>
    );
};
