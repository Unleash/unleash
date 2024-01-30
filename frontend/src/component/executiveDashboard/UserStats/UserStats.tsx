import { ChevronRight } from '@mui/icons-material';
import { Box, Typography, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useUiFlag } from 'hooks/useUiFlag';
import React from 'react';
import { Link } from 'react-router-dom';

const StyledContent = styled(Box)(({ theme }) => ({
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    backgroundColor: theme.palette.background.paper,
    maxWidth: 300,
    padding: theme.spacing(3),
}));

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
}

export const UserStats: React.FC<IUserStatsProps> = ({ count }) => {
    const showInactiveUsers = useUiFlag('showInactiveUsers');

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <StyledContent>
                    <StyledHeader variant='h1'>Total users</StyledHeader>
                    <StyledUserContainer>
                        <StyledUserBox>
                            <StyledUserCount variant='h2'>
                                {count}
                            </StyledUserCount>
                        </StyledUserBox>
                        <StyledCustomShadow />
                    </StyledUserContainer>

                    <ConditionallyRender
                        condition={showInactiveUsers}
                        show={
                            <>
                                <StyledUserDistributionContainer>
                                    <UserDistribution />
                                </StyledUserDistributionContainer>

                                <StyledDistInfoContainer>
                                    <UserDistributionInfo
                                        type='active'
                                        percentage='70'
                                        count='9999'
                                    />
                                    <UserDistributionInfo
                                        type='inactive'
                                        percentage='30'
                                        count='9999'
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
                </StyledContent>
            </Box>
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

const UserDistribution = () => {
    const getLineWidth = () => {
        return [80, 20];
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
        marginTop: theme.spacing(0.8),
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
            <StyledUserDistIndicator type={type} />
            <StyledDistInfoInnerContainer>
                <StyledDistInfoTextContainer>
                    <Typography variant='body1'>
                        {type === 'active' ? 'Active' : 'Inactive'} users
                    </Typography>
                    <Typography variant='body2'>{percentage}%</Typography>
                </StyledDistInfoTextContainer>
                <StyledCountTypography variant='h2'>
                    {count}
                </StyledCountTypography>
            </StyledDistInfoInnerContainer>
        </StyledUserDistContainer>
    );
};
