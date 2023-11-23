import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { ISegment } from 'interfaces/segment';
import { IFeatureStrategy } from 'interfaces/strategy';
import { Link } from 'react-router-dom';
import { formatEditStrategyPath } from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import { formatStrategyName } from 'utils/strategyNames';
import { styled } from '@mui/material';
import {
    ChangeRequestInfo,
    ChangeRequestStrategy,
} from 'hooks/api/getters/useStrategiesBySegment/useStrategiesBySegment';

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
    // three kinds:
    // 1. strategies without crs
    // 2. crs without strategies
    // 3. strategies with crs

    // create a layered dictionary:
    // { featureName: { existingStrategies: { ...strategy, changeRequests: [crs] }, newStrategies: [crs] }
    const flagDict: {
        [key: string]: {
            existingStrategies: {
                [key: string]:
                    | {
                          strategy?: IFeatureStrategy;
                          changeRequests: ChangeRequestInfo[];
                      }
                    | {
                          strategy: IFeatureStrategy;
                          changeRequests?: ChangeRequestInfo[];
                      };
            };
            newStrategies: ChangeRequestStrategy[];
        };
    } = Object.fromEntries(
        (strategies ?? []).map((strategy) => [
            strategy.featureName!,
            {
                existingStrategies: {
                    [strategy.id]: {
                        strategy: strategy,
                    },
                },
                newStrategies: [],
            },
        ]),
    );

    for (const crStrategy of changeRequestStrategies ?? []) {
        const { featureName } = crStrategy;

        const isExistingStrategy = 'id' in crStrategy;

        if (isExistingStrategy) {
            const { id } = crStrategy;
            const existingEntry = flagDict[featureName]?.existingStrategies[id];

            if (existingEntry) {
                existingEntry.changeRequests = crStrategy.changeRequests;
            } else {
                if (!flagDict[featureName]) {
                    flagDict[featureName] = {
                        existingStrategies: {
                            [id]: {
                                changeRequests: crStrategy.changeRequests,
                            },
                        },
                        newStrategies: [],
                    };
                } else {
                    flagDict[featureName].existingStrategies[
                        id
                    ].changeRequests = {
                        crStrategy.changeRequests,
                    };
                }
            }
        }
    }

    console.log(JSON.stringify(flagDict, null, 2));

    // group by flag name
    const features = (strategies ?? []).reduce((acc, strategy) => {
        if (!acc[strategy.featureName!]) {
            acc[strategy.featureName!] = [strategy];
        } else {
            acc[strategy.featureName!].push(strategy);
        }
        return acc;
    }, {} as { [key: string]: IFeatureStrategy[] });

    // can we turn strategies into strategies with optional CRs? Also, CR title?
    const existingStrategies: {
        [key: string]: IFeatureStrategy & {
            changeRequests?: ChangeRequestInfo[];
        };
    } = Object.fromEntries((strategies ?? []).map((s) => [s.id, s]));

    const { existing, notListed } = (changeRequestStrategies ?? []).reduce(
        (acc, strategy) => {
            if ('id' in strategy && strategy.id in existingStrategies) {
                existingStrategies[strategy.id].changeRequests =
                    strategy.changeRequests;
            } else {
                acc.notListed.push(strategy);
            }

            return acc;
        },
        { existing: [], notListed: [] },
    );

    console.log(existing, notListed);

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
                {strategies?.map((strategy) => (
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
                            {strategy.featureName!}{' '}
                            {formatStrategyNameParens(strategy)}
                        </StyledLink>
                    </li>
                ))}
                {changeRequestStrategies?.map((strategy, index) => (
                    <li key={'id' in strategy ? strategy.id : index}>
                        {strategy.featureName}{' '}
                        {formatStrategyNameParens(strategy)} - used in change
                        request(s): {formatChangeRequestLinks(strategy)}
                    </li>
                ))}
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

const formatChangeRequestLinks = ({
    projectId,
    changeRequests,
}: ChangeRequestStrategy) => {
    const makeLink = ({ id, title }: ChangeRequestInfo) => {
        const text = title ? `#${id} (${title})` : `#${id}`;
        return (
            <StyledLink
                key={id}
                to={formatChangeRequestPath(projectId, id)}
                target='_blank'
                rel='noopener noreferrer'
            >
                {text}
            </StyledLink>
        );
    };
    if (changeRequests.length < 2) {
        return changeRequests.map(makeLink);
    } else {
        const sorted = [...changeRequests].sort((a, b) => a.id - b.id);

        const last = sorted.at(-1)!;
        const first = sorted.slice(0, -1);

        return `${first.map(makeLink).join(', ')} and ${makeLink(last)}`;
    }
};
