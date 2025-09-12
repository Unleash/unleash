import { Button, styled, type ButtonProps } from '@mui/material';

const StyledActionContainer = styled('div')(({ theme }) => ({
    background: theme.palette.background.paper,
}));

export const FeatureStrategyMenuCardAction = (props: ButtonProps) => (
    <StyledActionContainer>
        <Button variant='outlined' size='small' {...props} />
    </StyledActionContainer>
);
