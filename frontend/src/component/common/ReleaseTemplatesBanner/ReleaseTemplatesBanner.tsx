import { IconButton, styled, Tooltip, Typography, Button, Box } from '@mui/material';
import type { FC } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bannerProgressionSvg from 'assets/img/banner-progression.svg';

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexFlow: 'column nowrap',
    gap: theme.spacing(2),
    padding: theme.spacing(3, 4),
    border: `1px solid ${theme.palette.secondary.border}`,
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: theme.palette.secondary.light,
    boxShadow: 'none',
    position: 'relative',
}));

const StyledContent = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
    justifyContent: 'space-between',
}));

const StyledText = styled(Box)(() => ({
    display: 'flex',
    flexFlow: 'column nowrap',
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
    margin: 0,
    marginBottom: theme.spacing(0.5),
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledButtonContainer = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(2),
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
}));

const StyledIllustration = styled(Box)(({ theme }) => ({
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    [theme.breakpoints.down('md')]: {
        display: 'none',
    },
}));

export const ReleaseTemplatesBanner: FC = () => {
    const { isEnterprise } = useUiConfig();
    const gtmReleaseManagementEnabled = useUiFlag('gtmReleaseManagement');
    const { trackEvent } = usePlausibleTracker();
    const navigate = useNavigate();

    const [bannerState, setBannerState] = useLocalStorageState<'open' | 'closed'>(
        'release-templates-banner:v1',
        'open',
    );

    useEffect(() => {
        if (isEnterprise() && gtmReleaseManagementEnabled && bannerState === 'open') {
            trackEvent('release-templates-banner', {
                props: {
                    eventType: 'seen',
                },
            });
        }
    }, []);

    if (!isEnterprise() || !gtmReleaseManagementEnabled) {
        return null;
    }

    if (bannerState === 'closed') {
        return null;
    }

    const onDismiss = () => {
        trackEvent('release-templates-banner', {
            props: {
                eventType: 'dismissed',
            },
        });
        setBannerState('closed');
    };

    const onCreateClick = () => {
        trackEvent('release-templates-banner', {
            props: {
                eventType: 'create-clicked',
            },
        });
        navigate('/release-templates/create-template');
    };

    return (
        <StyledContainer>
            <Tooltip title='Dismiss' arrow>
                <StyledCloseButton
                    aria-label='dismiss'
                    onClick={onDismiss}
                    size='small'
                >
                    <CloseIcon fontSize='inherit' />
                </StyledCloseButton>
            </Tooltip>
            <StyledContent>
                <StyledText>
                    <StyledTitle variant='h2'>Get started with release templates</StyledTitle>
                    <Typography color='text.secondary'>
                        Control your releases with milestones that can be
                        automatically enabled or paused.
                    </Typography>
                    <StyledButtonContainer>
                        <Button variant='contained' onClick={onCreateClick}>
                            Create template
                        </Button>
                    </StyledButtonContainer>
                </StyledText>
                <StyledIllustration>
                    <img
                        src={bannerProgressionSvg}
                        alt='Release progression'
                    />
                </StyledIllustration>
            </StyledContent>
        </StyledContainer>
    );
};
