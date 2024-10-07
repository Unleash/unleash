import type { FC, ReactNode } from 'react';
import { Box, Button, styled, Typography } from '@mui/material';
import { ThemeMode } from 'component/common/ThemeMode/ThemeMode';
import { ReactComponent as ProPlanIcon } from 'assets/icons/pro-enterprise-feature-badge.svg';
import { ReactComponent as ProPlanIconLight } from 'assets/icons/pro-enterprise-feature-badge-light.svg';

type PurchasableFeatureProps = {
    title: ReactNode;
    description: ReactNode;
    onClick: () => void;
};

const Icon = () => (
    <ThemeMode darkmode={<ProPlanIconLight />} lightmode={<ProPlanIcon />} />
);

const StyledContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2, 3),
    marginBottom: theme.spacing(3),
    background: theme.palette.background.elevation2,
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
        gap: theme.spacing(2),
    },
}));

const StyledIconContainer = styled(Box)(() => ({
    width: '36px',
    flexShrink: 0,
}));

const StyledMessage = styled(Box)(() => ({
    flexGrow: 1,
    display: 'flex',
}));

const StyledButtonContainer = styled(Box)(() => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    whiteSpace: 'nowrap',
}));

export const PurchasableFeature: FC<PurchasableFeatureProps> = ({
    title,
    description,
    onClick,
}) => {
    return (
        <StyledContainer>
            <StyledMessage>
                <StyledIconContainer>
                    <Icon />
                </StyledIconContainer>
                <Box>
                    <Typography variant='h3'>{title}</Typography>
                    <Typography>{description}</Typography>
                </Box>
            </StyledMessage>
            <StyledButtonContainer>
                <Button variant='contained' onClick={onClick}>
                    View pricing
                </Button>
            </StyledButtonContainer>
        </StyledContainer>
    );
};
