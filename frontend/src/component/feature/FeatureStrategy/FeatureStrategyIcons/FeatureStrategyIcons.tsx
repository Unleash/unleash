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
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const THRESHOLD = 4;
const MAX_WHEN_OVER = 3;

interface IFeatureStrategyIconsProps {
    strategies: IFeatureStrategy[] | undefined;
}

export const FeatureStrategyIcons = ({
    strategies,
}: IFeatureStrategyIconsProps) => {
    if (!strategies?.length) {
        return null;
    }

    if (strategies.length > THRESHOLD) {
        return (
            <StyledList aria-label="Feature strategies">
                {strategies.slice(0, MAX_WHEN_OVER).map(strategy => (
                    <StyledListItem key={strategy.id}>
                        <FeatureStrategyIcon strategyName={strategy.name} />
                    </StyledListItem>
                ))}
                <TooltipLink
                    tooltip={strategies.slice(MAX_WHEN_OVER).map(strategy => (
                        <StyledListItem key={strategy.id}>
                            <StyledItem>
                                <FeatureStrategyIcon
                                    strategyName={strategy.name}
                                />{' '}
                                {formatStrategyName(strategy.name)}
                            </StyledItem>
                        </StyledListItem>
                    ))}
                >
                    (+{strategies.length - MAX_WHEN_OVER})
                </TooltipLink>
            </StyledList>
        );
    }

    return (
        <StyledList aria-label="Feature strategies">
            {strategies.map(strategy => (
                <StyledListItem key={strategy.id}>
                    <FeatureStrategyIcon strategyName={strategy.name} />
                </StyledListItem>
            ))}
        </StyledList>
    );
};
