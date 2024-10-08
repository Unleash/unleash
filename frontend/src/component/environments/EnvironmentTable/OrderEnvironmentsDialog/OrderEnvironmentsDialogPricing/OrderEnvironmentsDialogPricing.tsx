import type { FC } from 'react';
import { Box, Card, styled, Typography } from '@mui/material';
import EnvironmentIcon from 'component/common/EnvironmentIcon/EnvironmentIcon';

const pricingOptions = [
    { environments: 1, price: 10 },
    { environments: 2, price: 20 },
    { environments: 3, price: 30 },
];

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    justifyContent: 'center',
    height: '100%',
    [theme.breakpoints.up('lg')]: {
        marginTop: theme.spacing(7.5),
    },
}));

const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
    boxShadow: 'none',
}));

const StyledCardContent = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: theme.spacing(2),
}));

export const OrderEnvironmentsDialogPricing: FC = () => (
    <StyledContainer>
        <Typography variant='h3' component='div' color='white' gutterBottom>
            Pricing
        </Typography>
        {pricingOptions.map((option) => (
            <StyledCard key={option.environments}>
                <StyledCardContent>
                    <EnvironmentIcon enabled />
                    <Box>
                        <Box>
                            <Typography variant='body2' fontWeight='bold'>
                                {option.environments} additional environment
                                {option.environments > 1 ? 's' : ''}
                            </Typography>
                        </Box>
                        <Typography variant='body2'>
                            ${option.price} per user per month
                        </Typography>
                    </Box>
                </StyledCardContent>
            </StyledCard>
        ))}
    </StyledContainer>
);
