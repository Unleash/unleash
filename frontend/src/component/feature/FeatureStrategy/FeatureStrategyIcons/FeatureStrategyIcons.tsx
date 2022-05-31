import { IFeatureStrategy } from 'interfaces/strategy';
import { FeatureStrategyIcon } from 'component/feature/FeatureStrategy/FeatureStrategyIcon/FeatureStrategyIcon';
import { styled } from '@mui/material';

interface IFeatureStrategyIconsProps {
    strategies: IFeatureStrategy[] | undefined;
}

export const FeatureStrategyIcons = ({
    strategies,
}: IFeatureStrategyIconsProps) => {
    if (!strategies?.length) {
        return null;
    }

    const strategyNames = strategies.map(strategy => strategy.name);
    const uniqueStrategyNames = uniqueValues(strategyNames);

    return (
        <StyledList aria-label="Feature strategies">
            {uniqueStrategyNames.map(strategyName => (
                <StyledListItem key={strategyName}>
                    <FeatureStrategyIcon strategyName={strategyName} />
                </StyledListItem>
            ))}
        </StyledList>
    );
};

const uniqueValues = <T,>(values: T[]): T[] => {
    return [...new Set(values)];
};

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
