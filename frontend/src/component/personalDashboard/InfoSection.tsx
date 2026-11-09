import { IconButton, styled, Tooltip, Typography } from '@mui/material';
import ProPlanIcon from 'assets/icons/pro-enterprise-feature-badge.svg?react';
import ProPlanIconLight from 'assets/icons/pro-enterprise-feature-badge-light.svg?react';
import type { FC } from 'react';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';
import { Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import { formatAssetPath } from 'utils/formatPath';
import upgradeHosted from 'assets/img/upgradeHosted.png';
import { EnterpriseBenefits } from './EnterpriseBenefits.tsx';

type InfoSectionProps = {};

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'column nowrap',
    gap: theme.spacing(2),
    padding: theme.spacing(3, 4),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: theme.palette.background.paper,
    boxShadow: 'none',
    position: 'relative',
}));

const StyledContent = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
}));

const StyledText = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'column nowrap',
    gap: theme.spacing(1),
}));

const StyledTitle = styled('h2')(({ theme }) => ({
    margin: theme.spacing(0, 0, 0.5),
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
}));

const StyledImage = styled('img')(({ theme }) => ({
    width: 235,
    margin: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
        display: 'none',
    },
}));

export const InfoSection: FC<InfoSectionProps> = () => {
    const [dashboardUpgrade, setDashboardUpgrade] = useLocalStorageState<
        'open' | 'closed'
    >('upgrade-dashboard:v1', 'open');

    if (dashboardUpgrade === 'closed') {
        return null;
    }

    const onDismiss = () => {
        setDashboardUpgrade('closed');
    };

    return (
        <StyledContainer>
            <Tooltip title='Dismiss' arrow>
                <StyledCloseButton
                    aria-label='dismiss'
                    onClick={onDismiss}
                    size='small'
                >
                    <CloseIcon />
                </StyledCloseButton>
            </Tooltip>
            <StyledContent>
                <StyledText>
                    <StyledTitle>
                        <ThemeMode
                            darkmode={<ProPlanIconLight />}
                            lightmode={<ProPlanIcon />}
                        />
                        Explore our Enterprise solution
                    </StyledTitle>
                    <Typography>
                        Increase efficiency and improve the development process
                        in your company with the full experience of Unleash with
                        some key advantages like:
                    </Typography>
                    <EnterpriseBenefits />
                    <div>
                        <Button href='https://www.getunleash.io/upgrade-unleash?utm_source=oss&utm_medium=feature&utm_content=dashboard'>
                            View full Enterprise offering
                        </Button>
                    </div>
                </StyledText>

                <StyledImage
                    src={formatAssetPath(upgradeHosted)}
                    alt='Upgrade Unleash'
                />
            </StyledContent>
        </StyledContainer>
    );
};
