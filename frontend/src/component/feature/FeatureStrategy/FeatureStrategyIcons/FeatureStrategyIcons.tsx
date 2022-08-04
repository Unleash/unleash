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
