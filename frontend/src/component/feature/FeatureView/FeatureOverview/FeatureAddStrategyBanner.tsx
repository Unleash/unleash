import { Link, styled } from '@mui/material';
import MenuBook from '@mui/icons-material/MenuBook';
import { useEventTracker } from 'hooks/useEventTracker';
import { FeatureSetupGuideBanner } from './FeatureSetupGuideBanner/FeatureSetupGuideBanner.tsx';
import ToggleOnOutlined from '@mui/icons-material/ToggleOnOutlined';

const StyledIconBox = styled('span')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: theme.spacing(4),
    height: theme.spacing(4),
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.common.white,
}));

const StyledLink = styled(Link)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    '&&': { color: theme.palette.primary.main },
}));

export const FeatureAddStrategyBanner = () => {
    const { trackEvent } = useEventTracker();

    return (
        <FeatureSetupGuideBanner
            variant='set-up-guide'
            icon={
                <StyledIconBox>
                    <ToggleOnOutlined fontSize='medium' />
                </StyledIconBox>
            }
            title='Next: Add roll out strategy'
            subtitle='You can do a standard on/off for all users, gradual rollouts, A/B tests or target specific user groups like beta testers.'
            actions={
                <StyledLink
                    href={
                        'https://docs.getunleash.io/reference/activation-strategies'
                    }
                    target='_blank'
                    rel='noreferrer'
                    underline='hover'
                    onClick={() =>
                        trackEvent('onboarding', {
                            props: { eventType: 'flag-add-strategy-clicked' },
                        })
                    }
                >
                    <MenuBook fontSize='small' />
                    View documentation
                </StyledLink>
            }
        />
    );
};
