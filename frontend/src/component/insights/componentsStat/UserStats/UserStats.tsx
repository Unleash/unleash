import type { FC } from 'react';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { Box, Typography, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useUiFlag } from 'hooks/useUiFlag';
import { Link } from 'react-router-dom';
import { HorizontalDistributionChart } from '../../components/HorizontalDistributionChart/HorizontalDistributionChart.tsx';
import { UserDistributionInfo } from './UserDistributionInfo.tsx';

const StyledUserContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
}));

const StyledUserBox = styled(Box)(({ theme }) => ({
    borderRadius: `${theme.shape.borderRadiusExtraLarge}px`,
    backgroundColor: theme.palette.background.alternative,
    maxWidth: 300,
    padding: theme.spacing(2),
    margin: `0 auto ${theme.spacing(3)}`,
    position: 'relative',
    zIndex: 2,
}));

const StyledCustomShadow = styled(Box)(({ theme }) => ({
    maxWidth: 270,
    height: '54px',
    backgroundColor: 'rgba(108, 101, 229, 0.30)',
    position: 'absolute',
    margin: '0 auto',
    top: '45px',
    left: '15px',
    right: '15px',
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
    isLoading?: boolean;
}

const StyledLoadingSkeleton = styled(Box)(() => ({
    '&:before': {
        background: 'transparent',
    },
}));

export const UserStats: FC<IUserStatsProps> = ({
    count,
    active,
    inactive,
    isLoading,
}) => {
    const showInactiveUsers = useUiFlag('showInactiveUsers');
    const showDistribution =
        showInactiveUsers && active !== undefined && inactive !== undefined;
    const activeUsersPercentage = ((active || 0) / count) * 100;

    return (
        <>
            <StyledUserContainer>
                <StyledUserBox>
                    <StyledUserCount variant='h2'>
                        <ConditionallyRender
                            condition={isLoading !== true}
                            show={
                                Number.parseInt(`${count}`, 10) === count
                                    ? count
                                    : count.toFixed(2)
                            }
                            elseShow={
                                <StyledLoadingSkeleton className='skeleton'>
                                    &nbsp;
                                </StyledLoadingSkeleton>
                            }
                        />
                    </StyledUserCount>
                </StyledUserBox>
                <StyledCustomShadow />
            </StyledUserContainer>

            <ConditionallyRender
                condition={showDistribution}
                show={
                    <>
                        <StyledUserDistributionContainer>
                            <HorizontalDistributionChart
                                sections={[
                                    {
                                        type: 'success',
                                        value: activeUsersPercentage,
                                    },
                                    {
                                        type: 'warning',
                                        value: 100 - activeUsersPercentage,
                                    },
                                ]}
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
