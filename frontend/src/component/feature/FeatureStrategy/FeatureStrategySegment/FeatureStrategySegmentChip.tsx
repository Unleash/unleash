import React from 'react';
import { Link } from 'react-router-dom';
import { ISegment } from 'interfaces/segment';
import { Clear, VisibilityOff, Visibility } from '@material-ui/icons';
import { useStyles } from './FeatureStrategySegmentChip.styles';
import ConditionallyRender from 'component/common/ConditionallyRender';
import { constraintAccordionListId } from 'component/common/ConstraintAccordion/ConstraintAccordionList/ConstraintAccordionList';

interface IFeatureStrategySegmentListProps {
    segment: ISegment;
    setSegments: React.Dispatch<React.SetStateAction<ISegment[]>>;
    preview?: ISegment;
    setPreview: React.Dispatch<React.SetStateAction<ISegment | undefined>>;
}

export const FeatureStrategySegmentChip = ({
    segment,
    setSegments,
    preview,
    setPreview,
}: IFeatureStrategySegmentListProps) => {
    const styles = useStyles();

    const onRemove = () => {
        setSegments(prev => {
            return prev.filter(s => s.id !== segment.id);
        });
        setPreview(prev => {
            return prev === segment ? undefined : prev;
        });
    };

    const onTogglePreview = () => {
        setPreview(prev => {
            return prev === segment ? undefined : segment;
        });
    };

    const togglePreviewIcon = (
        <ConditionallyRender
            condition={segment === preview}
            show={
                <VisibilityOff
                    titleAccess="Hide preview"
                    className={styles.icon}
                />
            }
            elseShow={
                <Visibility
                    titleAccess="Show preview"
                    className={styles.icon}
                />
            }
        />
    );

    return (
        <span className={styles.chip}>
            <Link
                to={`/segments/edit/${segment.id}`}
                target="_blank"
                className={styles.link}
            >
                {segment.name}
            </Link>
            <button
                type="button"
                onClick={onTogglePreview}
                className={styles.button}
                aria-expanded={segment === preview}
                aria-controls={constraintAccordionListId}
            >
                {togglePreviewIcon}
            </button>
            <button type="button" onClick={onRemove} className={styles.button}>
                <Clear titleAccess="Remove" className={styles.icon} />
            </button>
        </span>
    );
};
