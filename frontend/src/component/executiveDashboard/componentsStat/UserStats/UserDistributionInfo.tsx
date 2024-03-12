import type React from 'react';
import { Box, Typography, styled } from '@mui/material';

type UserType = 'active' | 'inactive';

interface StyledLinearProgressProps {
    type: UserType;
}
const StyledUserDistContainer = styled(Box)(({ theme }) => ({
    padding: `${theme.spacing(1.5)} ${theme.spacing(2)}`,
    borderRadius: `${theme.shape.borderRadius}px`,
    border: `1px solid ${theme.palette.divider}`,
}));

const StyledUserDistIndicator = styled(Box)<StyledLinearProgressProps>(
    ({ theme, type }) => ({
        width: 8,
        height: 8,
        backgroundColor:
            type === 'active'
                ? theme.palette.success.border
                : theme.palette.warning.border,
        borderRadius: `2px`,
        marginRight: theme.spacing(1),
    }),
);

interface IUserDistributionInfoProps {
    type: UserType;
    count: string;
    percentage: string;
}

const StyledDistInfoInnerContainer = styled(Box)(() => ({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
}));

const StyledDistInfoTextContainer = styled(Box)(() => ({
    display: 'flex',
    flexDirection: 'column',
}));

const StyledCountTypography = styled(Typography)(() => ({
    marginLeft: 'auto',
    fontWeight: 'normal',
}));

export const UserDistributionInfo: React.FC<IUserDistributionInfoProps> = ({
    type,
    count,
    percentage,
}) => {
    return (
        <StyledUserDistContainer>
            <StyledDistInfoInnerContainer>
                <StyledDistInfoTextContainer>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <StyledUserDistIndicator type={type} />
                        <Typography variant='body1' component='span'>
                            {type === 'active' ? 'Active' : 'Inactive'} users
                        </Typography>
                    </Box>
                    <Typography variant='body2'>{percentage}%</Typography>
                </StyledDistInfoTextContainer>
                <StyledCountTypography variant='h2'>
                    {count}
                </StyledCountTypography>
            </StyledDistInfoInnerContainer>
        </StyledUserDistContainer>
    );
};
