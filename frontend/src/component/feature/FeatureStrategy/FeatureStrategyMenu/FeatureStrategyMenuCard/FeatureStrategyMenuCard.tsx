import { IStrategy } from 'interfaces/strategy';
import { Link } from 'react-router-dom';
import {
    getFeatureStrategyIcon,
    formatStrategyName,
} from 'utils/strategyNames';
import { formatCreateStrategyPath } from 'component/feature/FeatureStrategy/FeatureStrategyCreate/FeatureStrategyCreate';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { styled } from '@mui/material';

interface IFeatureStrategyMenuCardProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    strategy: IStrategy;
}

const StyledIcon = styled('div')(({ theme }) => ({
    width: theme.spacing(4),
    height: 'auto',
    '& > svg': {
        // Styling for SVG icons.
        fill: theme.palette.primary.main,
    },
    '& > div': {
        // Styling for the Rollout icon.
        height: theme.spacing(2),
        marginLeft: '-.75rem',
        color: theme.palette.primary.main,
    },
}));

const StyledDescription = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
}));

const StyledName = styled(StringTruncator)(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
}));

const StyledCard = styled(Link)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '3rem 1fr',
    width: '20rem',
    padding: theme.spacing(2),
    color: 'inherit',
    textDecoration: 'inherit',
    lineHeight: 1.25,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
    borderRadius: theme.spacing(1),
    '&:hover, &:focus': {
        borderColor: theme.palette.primary.main,
    },
}));

export const FeatureStrategyMenuCard = ({
    projectId,
    featureId,
    environmentId,
    strategy,
}: IFeatureStrategyMenuCardProps) => {
    const StrategyIcon = getFeatureStrategyIcon(strategy.name);
    const strategyName = formatStrategyName(strategy.name);

    const createStrategyPath = formatCreateStrategyPath(
        projectId,
        featureId,
        environmentId,
        strategy.name
    );

    return (
        <StyledCard to={createStrategyPath}>
            <StyledIcon>
                <StrategyIcon />
            </StyledIcon>
            <div>
                <StyledName
                    text={strategy.displayName || strategyName}
                    maxWidth="200"
                    maxLength={25}
                />
                <StyledDescription>{strategy.description}</StyledDescription>
            </div>
        </StyledCard>
    );
};
