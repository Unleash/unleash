import { styled } from '@mui/material';
import { ReactComponent as ProPlanIcon } from 'assets/icons/pro-enterprise-feature-badge.svg';
import { ReactComponent as ProPlanIconLight } from 'assets/icons/pro-enterprise-feature-badge-light.svg';
import type { FC } from 'react';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';
import { Button } from '@mui/material';

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
}));

const StyledTitle = styled('h2')(({ theme }) => ({
    margin: 0,
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledList = styled('ul')(({ theme }) => ({
    listStyle: 'none',
    padding: 0,
    margin: 0,
    fontSize: theme.typography.body2.fontSize,
    '& li': {},
}));

const StyledListItem = styled('li')(({ theme }) => ({
    position: 'relative',
    paddingLeft: theme.spacing(2.5),
    marginBottom: theme.spacing(0.5),
    '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        bottom: theme.spacing(0.625),
        width: theme.spacing(1.5),
        height: theme.spacing(1.5),
        borderRadius: theme.spacing(0.5),
        backgroundColor: theme.palette.primary.main,
    },
}));

export const InfoSection: FC<InfoSectionProps> = () => {
    return (
        <StyledContainer>
            <StyledTitle>
                <ThemeMode
                    darkmode={<ProPlanIconLight />}
                    lightmode={<ProPlanIcon />}
                />
                Explore our Enterprise solution
            </StyledTitle>
            <p>
                Increase efficiency and improve the development process in your
                company with the full experience of Unleash with some key
                advantages like:
            </p>
            <StyledList>
                <StyledListItem>
                    Unlimited projects and environments
                </StyledListItem>
                <StyledListItem>
                    Managed or self-hosted with premium support
                </StyledListItem>
                <StyledListItem>
                    SSO/SCIM - streamlined access and account management
                </StyledListItem>
                <StyledListItem>RBAC - precise access control</StyledListItem>
                <StyledListItem>
                    Change requests - reduce error risk with pull-request like
                    experience
                </StyledListItem>
            </StyledList>
            <div>
                <Button href='https://www.getunleash.io/upgrade_unleash?utm_source=dashboard'>
                    View full Enterprise offering
                </Button>
            </div>
        </StyledContainer>
    );
};
