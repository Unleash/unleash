import { ReactComponent as ProPlanIcon } from 'assets/icons/pro-enterprise-feature-badge.svg';
import { Box, Link, styled, Typography } from '@mui/material';

export interface ProFeatureTooltipProps {
    children: React.ReactNode;
}

const ProFeatureTooltipWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(1, 0.5),
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSizes.smallBody,
    gap: theme.spacing(1),
}));

const StyledBody = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    margin: theme.spacing(1, 0),
}));

const StyledLink = styled(Link)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    width: 'fit-content',
}));

export const ProFeatureTooltip = ({ children }: ProFeatureTooltipProps) => {
    return (
        <ProFeatureTooltipWrapper>
            <StyledTitle>
                <ProPlanIcon />
                Pro & Enterprise feature
            </StyledTitle>
            <StyledBody>{children}</StyledBody>
            <StyledLink
                href={'https://www.getunleash.io/plans'}
                target="_blank"
            >
                Upgrade now
            </StyledLink>
        </ProFeatureTooltipWrapper>
    );
};
