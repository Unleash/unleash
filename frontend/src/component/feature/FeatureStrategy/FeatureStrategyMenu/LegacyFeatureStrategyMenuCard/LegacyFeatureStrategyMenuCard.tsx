import type { IStrategy } from 'interfaces/strategy';
import { Link } from 'react-router-dom';
import {
    getFeatureStrategyIcon,
    formatStrategyName,
} from 'utils/strategyNames';
import { formatCreateStrategyPath } from 'component/feature/FeatureStrategy/FeatureStrategyCreate/FeatureStrategyCreate';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { styled } from '@mui/material';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { Truncator } from 'component/common/Truncator/Truncator';

interface IFeatureStrategyMenuCardProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    strategy: Pick<IStrategy, 'name' | 'displayName' | 'description'> &
        Partial<IStrategy>;
    defaultStrategy?: boolean;
    onClose: () => void;
}

const StyledIcon = styled('div')(({ theme }) => ({
    width: theme.spacing(3),
    '& > svg': {
        width: theme.spacing(2.25),
        height: theme.spacing(2.25),
        fill: theme.palette.primary.main,
    },
}));

const StyledName = styled(StringTruncator)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.caption.fontSize,
    display: 'block',
    marginBottom: theme.spacing(0.5),
}));

const StyledCard = styled(Link)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '30rem',
    padding: theme.spacing(1.5, 2),
    color: 'inherit',
    textDecoration: 'inherit',
    lineHeight: 1.25,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
    borderRadius: theme.spacing(1),
    overflow: 'hidden',
    '&:hover, &:focus': {
        borderColor: theme.palette.primary.main,
    },
}));

const StyledTopRow = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
}));

export const LegacyFeatureStrategyMenuCard = ({
    projectId,
    featureId,
    environmentId,
    strategy,
    defaultStrategy,
    onClose,
}: IFeatureStrategyMenuCardProps) => {
    const StrategyIcon = getFeatureStrategyIcon(strategy.name);
    const strategyName = formatStrategyName(strategy.name);
    const { trackEvent } = usePlausibleTracker();

    const createStrategyPath = formatCreateStrategyPath(
        projectId,
        featureId,
        environmentId,
        strategy.name,
        defaultStrategy,
    );

    const openStrategyCreationModal = () => {
        trackEvent('strategy-add', {
            props: {
                buttonTitle: strategy.displayName || strategyName,
            },
        });
        onClose();
    };

    return (
        <StyledCard to={createStrategyPath} onClick={openStrategyCreationModal}>
            <StyledTopRow>
                <StyledIcon>
                    <StrategyIcon />
                </StyledIcon>
                <StyledName
                    text={strategy.displayName || strategyName}
                    maxWidth='200'
                    maxLength={25}
                />
            </StyledTopRow>
            <Truncator
                lines={1}
                title={strategy.description}
                arrow
                sx={{
                    fontSize: (theme) => theme.typography.caption.fontSize,
                    width: '100%',
                }}
            >
                {strategy.description}
            </Truncator>
        </StyledCard>
    );
};
