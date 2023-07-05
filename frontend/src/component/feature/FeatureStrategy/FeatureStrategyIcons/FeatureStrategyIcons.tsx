import { IFeatureStrategy } from 'interfaces/strategy';
import { FeatureStrategyIcon } from 'component/feature/FeatureStrategy/FeatureStrategyIcon/FeatureStrategyIcon';
import { styled } from '@mui/material';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { formatStrategyName } from 'utils/strategyNames';

const StyledList = styled('ul')(() => ({
    all: 'unset',
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
}));

const StyledListItem = styled('li')(() => ({
    all: 'unset',
    minWidth: 30,
    textAlign: 'center',
}));

const StyledItem = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const THRESHOLD = 5;

interface IFeatureStrategyIconsProps {
    strategies: IFeatureStrategy[] | undefined;
}

export const FeatureStrategyIcons = ({
    strategies,
}: IFeatureStrategyIconsProps) => {
    if (!strategies?.length) {
        return null;
    }

    if (strategies.length > THRESHOLD + 1) {
        return (
            <StyledList aria-label="Feature strategies">
                {strategies.slice(0, THRESHOLD).map(strategy => (
                    <StyledListItem key={strategy.id}>
                        <FeatureStrategyIcon strategy={strategy} />
                    </StyledListItem>
                ))}
                <TooltipLink
                    tooltip={strategies.slice(THRESHOLD).map(strategy => (
                        <StyledListItem key={strategy.id}>
                            <StyledItem>
                                <FeatureStrategyIcon strategy={strategy} />{' '}
                                {formatStrategyName(strategy.name) +
                                    (strategy.title
                                        ? ` - ${strategy.title}`
                                        : '')}
                            </StyledItem>
                        </StyledListItem>
                    ))}
                >
                    (+{strategies.length - THRESHOLD})
                </TooltipLink>
            </StyledList>
        );
    }

    return (
        <StyledList aria-label="Feature strategies">
            {strategies.map(strategy => (
                <StyledListItem key={strategy.id}>
                    <FeatureStrategyIcon strategy={strategy} />
                </StyledListItem>
            ))}
        </StyledList>
    );
};
