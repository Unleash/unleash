import { ReactComponent as ProPlanIcon } from '../../../assets/icons/pro-feature-badge.svg';
import { Box, Link, styled, tooltipClasses, Typography } from '@mui/material';

export interface ProFeatureTooltipProps {
    text: string;
}

const ProFeatureTooltipWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1, 1.5),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
    color: theme.palette.text.primary,
    width: '100%',
}));

export const ProFeatureTooltip = ({ text }: ProFeatureTooltipProps) => {
    return (
        <ProFeatureTooltipWrapper>
            <Typography sx={{ justifyContent: 'center', flexDirection: 'row' }}>
                <ProPlanIcon />
                <span style={{ marginLeft: '4px' }}>Pro feature</span>
            </Typography>
            <Typography sx={{ alignContent: 'center' }}>{text}</Typography>
            <Typography sx={{ alignContent: 'center' }}>
                <Link target={'https://www.getunleash.io/plans'}>
                    Upgrade now
                </Link>
            </Typography>
        </ProFeatureTooltipWrapper>
    );
};
