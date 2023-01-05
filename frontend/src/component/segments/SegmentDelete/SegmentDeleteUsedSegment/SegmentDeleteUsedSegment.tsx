import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { ISegment } from 'interfaces/segment';
import { IFeatureStrategy } from 'interfaces/strategy';
import { Link } from 'react-router-dom';
import { formatEditStrategyPath } from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import { formatStrategyName } from 'utils/strategyNames';
import { styled } from '@mui/material';

const StyledUl = styled('ul')({
    marginBottom: 0,
});

const StyledLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    color: theme.palette.primary.main,
    fontWeight: theme.fontWeight.bold,
}));

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
            <StyledUl>
                {strategies?.map(strategy => (
                    <li key={strategy.id}>
                        <StyledLink
                            to={formatEditStrategyPath(
                                strategy.projectId!,
                                strategy.featureName!,
                                strategy.environment!,
                                strategy.id
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {strategy.featureName!}{' '}
                            {formatStrategyNameParens(strategy)}
                        </StyledLink>
                    </li>
                ))}
            </StyledUl>
        </Dialogue>
    );
};

const formatStrategyNameParens = (strategy: IFeatureStrategy): string => {
    if (!strategy.strategyName) {
        return '';
    }

    return `(${formatStrategyName(strategy.strategyName)})`;
};
