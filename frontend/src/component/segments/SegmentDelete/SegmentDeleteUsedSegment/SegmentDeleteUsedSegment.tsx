import React from 'react';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { useStyles } from '../SegmentDeleteConfirm/SegmentDeleteConfirm.styles';
import { ISegment } from 'interfaces/segment';
import { IFeatureStrategy } from 'interfaces/strategy';
import { Link } from 'react-router-dom';
import { formatEditStrategyPath } from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import { formatStrategyName } from 'utils/strategyNames';

interface ISegmentDeleteUsedSegmentProps {
    segment: ISegment;
    open: boolean;
    onClose: () => void;
    strategies: IFeatureStrategy[] | undefined;
}

export const SegmentDeleteUsedSegment = ({
    segment,
    open,
    onClose,
    strategies,
}: ISegmentDeleteUsedSegmentProps) => {
    const { classes: styles } = useStyles();

    return (
        <Dialogue
            title="You can't delete a segment that's currently in use"
            open={open}
            primaryButtonText="OK"
            onClick={onClose}
        >
            <p>
                The following feature toggles are using the{' '}
                <strong>{segment.name}</strong> segment for their strategies:
            </p>
            <ul>
                {strategies?.map(strategy => (
                    <li key={strategy.id}>
                        <Link
                            to={formatEditStrategyPath(
                                strategy.projectId!,
                                strategy.featureName!,
                                strategy.environment!,
                                strategy.id
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.link}
                        >
                            {strategy.featureName!}{' '}
                            {formatStrategyNameParens(strategy)}
                        </Link>
                    </li>
                ))}
            </ul>
        </Dialogue>
    );
};

const formatStrategyNameParens = (strategy: IFeatureStrategy): string => {
    if (!strategy.strategyName) {
        return '';
    }

    return `(${formatStrategyName(strategy.strategyName)})`;
};
