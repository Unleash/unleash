import React from 'react';
import { Link } from 'react-router-dom';
import { ISegment } from 'interfaces/segment';
import { Clear, VisibilityOff, Visibility } from '@mui/icons-material';
import { useStyles } from './FeatureStrategySegmentChip.styles';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { constraintAccordionListId } from 'component/common/ConstraintAccordion/ConstraintAccordionList/ConstraintAccordionList';
import { Tooltip } from '@mui/material';

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
    const { classes: styles } = useStyles();

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
            show={<VisibilityOff titleAccess="Hide" className={styles.icon} />}
            elseShow={<Visibility titleAccess="Show" className={styles.icon} />}
        />
    );

    const previewIconTooltip =
        segment === preview
            ? 'Hide segment constraints'
            : 'Preview segment constraints';

    return (
        <span className={styles.chip}>
            <Link
                to={`/segments/edit/${segment.id}`}
                target="_blank"
                className={styles.link}
            >
                {segment.name}
            </Link>
            <Tooltip title={previewIconTooltip} arrow>
                <button
                    type="button"
                    onClick={onTogglePreview}
                    className={styles.button}
                    aria-expanded={segment === preview}
                    aria-controls={constraintAccordionListId}
                >
                    {togglePreviewIcon}
                </button>
            </Tooltip>
            <Tooltip title="Remove segment" arrow>
                <button
                    type="button"
                    onClick={onRemove}
                    className={styles.button}
                >
                    <Clear titleAccess="Remove" className={styles.icon} />
                </button>
            </Tooltip>
        </span>
    );
};
