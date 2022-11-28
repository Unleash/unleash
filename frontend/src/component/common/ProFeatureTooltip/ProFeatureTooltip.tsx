import { ReactComponent as ProPlanIcon } from 'assets/icons/pro-enterprise-feature-badge.svg';
import { Box, Link, styled, Typography } from '@mui/material';

export interface ProFeatureTooltipProps {
    text: string;
}

const ProFeatureTooltipWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1, 1.5),
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.text.primary,
    width: '100%',
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
    display: 'inline-flex',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    marginBottom: theme.spacing(1),
}));

export const ProFeatureTooltip = ({ text }: ProFeatureTooltipProps) => {
    return (
        <ProFeatureTooltipWrapper>
            <StyledTitle>
                <ProPlanIcon />
                <span style={{ marginLeft: '4px' }}>
                    Pro & Enterprise feature
                </span>
            </StyledTitle>
            <Typography sx={{ alignContent: 'center' }}>{text}</Typography>
            <Typography sx={{ alignContent: 'center' }}>
                <Link target={'https://www.getunleash.io/plans'}>
                    Upgrade now
                </Link>
            </Typography>
        </ProFeatureTooltipWrapper>
    );
};
