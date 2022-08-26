import React, { Fragment, useState } from 'react';
import { ISegment } from 'interfaces/segment';
import { useStyles } from 'component/feature/FeatureStrategy/FeatureStrategySegment/FeatureStrategySegmentList.styles';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { FeatureStrategySegmentChip } from 'component/feature/FeatureStrategy/FeatureStrategySegment/FeatureStrategySegmentChip';
import { SegmentItem } from 'component/common/SegmentItem/SegmentItem';

interface IFeatureStrategySegmentListProps {
    segments: ISegment[];
    setSegments: React.Dispatch<React.SetStateAction<ISegment[]>>;
}

export const FeatureStrategySegmentList = ({
    segments,
    setSegments,
}: IFeatureStrategySegmentListProps) => {
    const { classes: styles } = useStyles();
    const [preview, setPreview] = useState<ISegment>();
    const lastSegmentIndex = segments.length - 1;

    if (segments.length === 0) {
        return null;
    }

    return (
        <>
            <ConditionallyRender
                condition={segments && segments.length > 0}
                show={
                    <p className={styles.selectedSegmentsLabel}>
                        Selected Segments
                    </p>
                }
            />
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
                condition={Boolean(preview)}
                show={() => <SegmentItem segment={preview!} isExpanded />}
            />
        </>
    );
};
