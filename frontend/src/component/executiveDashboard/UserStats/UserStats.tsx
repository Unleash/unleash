import React, { type FC } from 'react';
import { ChevronRight } from '@mui/icons-material';
import { Box, Typography, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useUiFlag } from 'hooks/useUiFlag';
import { Link } from 'react-router-dom';

const StyledUserContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
}));

const StyledUserBox = styled(Box)(({ theme }) => ({
    borderRadius: `${theme.shape.borderRadiusExtraLarge}px`,
    backgroundColor: theme.palette.primary.main,
    maxWidth: 300,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    position: 'relative',
    zIndex: 2,
}));

const StyledCustomShadow = styled(Box)(({ theme }) => ({
    width: '220px',
    height: '54px',
    backgroundColor: 'rgba(108, 101, 229, 0.30)',
    position: 'absolute',
    margin: '0 auto',
    top: '45px',
    left: '15px',
    borderRadius: `${theme.shape.borderRadiusExtraLarge}px`,
    zIndex: 1,
}));

const StyledUserDistributionContainer = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(2.5),
}));

const StyledUserCount = styled(Typography)(({ theme }) => ({
    color: theme.palette.primary.contrastText,
    fontWeight: 'bold',
    fontSize: theme.fontSizes.extraLargeHeader,
    margin: 0,
    padding: 0,
}));

const StyledHeader = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    fontSize: theme.fontSizes.bodySize,
    fontWeight: 'bold',
}));

const StyledDistInfoContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
});

const StyledLinkContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(3),
}));

const StyledLink = styled(Link)({
    fontWeight: 'bold',
    textDecoration: 'none',
    display: 'flex',
    justifyContent: 'center',
});

interface IUserStatsProps {
    count: number;
    active?: number;
    inactive?: number;
}

export const UserStats: FC<IUserStatsProps> = ({ count, active, inactive }) => {
    const showInactiveUsers = useUiFlag('showInactiveUsers');
    const showDistribution =
        showInactiveUsers && active !== undefined && inactive !== undefined;
    const activeUsersPercentage = ((active || 0) / count) * 100;

    return (
        <>
            <StyledUserContainer>
                <StyledUserBox>
                    <StyledUserCount variant='h2'>{count}</StyledUserCount>
                </StyledUserBox>
                <StyledCustomShadow />
            </StyledUserContainer>

            <ConditionallyRender
                condition={showDistribution}
                show={
                    <>
                        <StyledUserDistributionContainer>
                            <UserDistribution
                                activeUsersPercentage={activeUsersPercentage}
                            />
                        </StyledUserDistributionContainer>

                        <StyledDistInfoContainer>
                            <UserDistributionInfo
                                type='active'
                                percentage={`${activeUsersPercentage}`}
                                count={`${active}`}
                            />
                            <UserDistributionInfo
                                type='inactive'
                                percentage={`${100 - activeUsersPercentage}`}
                                count={`${inactive}`}
                            />
                        </StyledDistInfoContainer>
                    </>
                }
            />

            <StyledLinkContainer>
                <StyledLink to='/admin/users'>
                    View users <ChevronRight />
                </StyledLink>
            </StyledLinkContainer>
        </>
    );
};

type UserType = 'active' | 'inactive';

interface StyledLinearProgressProps {
    type: UserType;
}

const StyledUserDistributionLine = styled(Box)<StyledLinearProgressProps>(
    ({ theme, type }) => ({
        borderRadius: theme.shape.borderRadius,
        height: 16,
        backgroundColor:
            type === 'active'
                ? theme.palette.success.border
                : theme.palette.warning.border,
    }),
);

const UserDistribution = ({ activeUsersPercentage = 100 }) => {
    const getLineWidth = () => {
        return [activeUsersPercentage, 100 - activeUsersPercentage];
    };

    const [activeWidth, inactiveWidth] = getLineWidth();

    return (
        <Box sx={{ display: 'flex' }}>
            <StyledUserDistributionLine
                type='active'
                sx={{ width: `${activeWidth}%` }}
            />
            <StyledUserDistributionLine
                type='inactive'
                sx={(theme) => ({
                    width: `${inactiveWidth}%`,
                    marginLeft: theme.spacing(0.5),
                })}
            />
        </Box>
    );
};

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

const StyledDistInfoInnerContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
}));

const StyledDistInfoTextContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
}));

const StyledCountTypography = styled(Typography)(({ theme }) => ({
    marginLeft: 'auto',
    fontWeight: 'normal',
}));

const UserDistributionInfo: React.FC<IUserDistributionInfoProps> = ({
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
