import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { ISegment } from 'interfaces/segment';
import { IFeatureStrategy } from 'interfaces/strategy';
import { Link } from 'react-router-dom';
import { formatEditStrategyPath } from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import { formatStrategyName } from 'utils/strategyNames';
import { styled } from '@mui/material';
import {
    ChangeRequestInfo,
    ChangeRequestNewStrategy,
    ChangeRequestStrategy,
    ChangeRequestUpdatedStrategy,
} from 'hooks/api/getters/useStrategiesBySegment/useStrategiesBySegment';
import { sortStrategiesByFeature } from './sort-strategies';

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
    changeRequestStrategies: ChangeRequestStrategy[] | undefined;
}

export const formatChangeRequestPath = (
    projectId: string,
    changeRequestId: number,
): string => {
    return `/projects/${projectId}/change-requests/${changeRequestId}`;
};

export const SegmentDeleteUsedSegment = ({
    segment,
    open,
    onClose,
    strategies,
    changeRequestStrategies,
}: ISegmentDeleteUsedSegmentProps) => {
    const sortedStrategies = sortStrategiesByFeature(
        strategies ?? [],
        changeRequestStrategies ?? [],
    );

    return (
        <Dialogue
            title="You can't delete a segment that's currently in use"
            open={open}
            primaryButtonText='OK'
            onClick={onClose}
        >
            <p>
                The following feature toggles are using the{' '}
                <strong>{segment.name}</strong> segment for their strategies:
            </p>
            <StyledUl>
                {sortedStrategies.map((strategy, index) =>
                    strategyListItem(strategy, index),
                )}
            </StyledUl>
        </Dialogue>
    );
};

const formatStrategyNameParens = (strategy: {
    strategyName?: string;
}): string => {
    if (!strategy.strategyName) {
        return '';
    }

    return `(${formatStrategyName(strategy.strategyName)})`;
};

// const formatChangeRequestLinks = ({ projectId }: ChangeRequestStrategy) => {
//     const makeLink = ({ id, title }: ChangeRequestInfo) => {
//         const text = title ? `#${id} (${title})` : `#${id}`;
//         return (
//             <StyledLink
//                 key={id}
//                 to={formatChangeRequestPath(projectId, id)}
//                 target='_blank'
//                 rel='noopener noreferrer'
//             >
//                 {text}
//             </StyledLink>
//         );
//     };
//     if (changeRequests.length < 2) {
//         return changeRequests.map(makeLink);
//     } else {
//         const sorted = [...changeRequests].sort((a, b) => a.id - b.id);

//         const last = sorted.at(-1)!;
//         const first = sorted.slice(0, -1);

//         return `${first.map(makeLink).join(', ')} and ${makeLink(last)}`;
//     }
// };

const strategyListItem = (
    strategy:
        | IFeatureStrategy
        | ChangeRequestUpdatedStrategy
        | ChangeRequestNewStrategy,
    index: number,
) => {
    const isChangeRequest = (
        strategy: IFeatureStrategy | ChangeRequestStrategy,
    ): strategy is ChangeRequestStrategy => 'changeRequest' in strategy;

    if (isChangeRequest(strategy)) {
        const { id, title } = strategy.changeRequest;

        const text = title ? `#${id} (${title})` : `#${id}`;
        return (
            <li key={`#${strategy.changeRequest.id}@${index}`}>
                <p>
                    {strategy.featureName}{' '}
                    {formatStrategyNameParens(strategy) +
                        ' — in change request '}

                    <StyledLink
                        to={formatChangeRequestPath(strategy.projectId, id)}
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        {text}
                    </StyledLink>
                </p>
            </li>
        );
    } else {
        return (
            <li key={strategy.id}>
                <StyledLink
                    to={formatEditStrategyPath(
                        strategy.projectId!,
                        strategy.featureName!,
                        strategy.environment!,
                        strategy.id,
                    )}
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    {strategy.featureName!} {formatStrategyNameParens(strategy)}
                </StyledLink>
            </li>
        );
    }
};
