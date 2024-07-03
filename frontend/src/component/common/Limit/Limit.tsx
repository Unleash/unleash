import { Box, IconButton, styled, Tooltip, Typography } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { Link } from 'react-router-dom';
import WarningIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import type { FC } from 'react';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    border: `2px solid ${theme.palette.background.application}`,
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
}));

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadiusMedium,
}));

const StyledWarningIcon = styled(WarningIcon)(({ theme }) => ({
    color: theme.palette.warning.main,
}));

const StyledErrorIcon = styled(ErrorIcon)(({ theme }) => ({
    color: theme.palette.warning.main,
}));

const Header = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
    fontWeight: 'bold',
    borderBottom: `2px solid ${theme.palette.background.application}`,
    padding: theme.spacing(3, 4),
    fontSize: theme.fontSizes.mainHeader,
}));

const Footer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3, 4),
}));

const Main = styled(Box)(({ theme }) => ({
    borderBottom: `2px solid ${theme.palette.background.application}`,
    padding: theme.spacing(3, 4),
}));

const LimitStats = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

const LimitExplanation = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(1.5),
}));

const ExpandableBox = styled(Box)(({ theme }) => ({
    flex: 1,
}));

export const Limit: FC<{
    name: string;
    shortName?: string;
    limit: number;
    currentValue: number;
    onClose?: () => void;
}> = ({ name, shortName, limit, currentValue, onClose }) => {
    const percentageLimit = Math.round((currentValue / limit) * 100);
    const belowLimit = currentValue < limit;
    const threshold = 80;

    if (percentageLimit < threshold) {
        return null;
    }

    return (
        <StyledBox>
            <Header>
                <ConditionallyRender
                    condition={belowLimit}
                    show={<StyledWarningIcon />}
                    elseShow={<StyledErrorIcon />}
                />

                <ConditionallyRender
                    condition={belowLimit}
                    show={
                        <ExpandableBox>
                            You are nearing the limit for {name}
                        </ExpandableBox>
                    }
                    elseShow={
                        <ExpandableBox>
                            You reached the limit for {name}
                        </ExpandableBox>
                    }
                />

                <ConditionallyRender
                    condition={typeof onClose === 'function'}
                    show={
                        <Tooltip title='Close' arrow describeChild>
                            <IconButton onClick={onClose}>
                                <CloseIcon />
                            </IconButton>
                        </Tooltip>
                    }
                />
            </Header>
            <Main>
                <LimitStats>
                    You have added {currentValue} {shortName ?? name}, that is
                    equivalent to{' '}
                    <Typography component='span' color='primary'>
                        {percentageLimit}%
                    </Typography>{' '}
                    of the limit.
                </LimitStats>
                <BorderLinearProgress
                    variant='determinate'
                    value={Math.min(100, percentageLimit)}
                />
                <LimitExplanation>
                    <Link
                        target='_blank'
                        to={'https://docs.getunleash.io/reference/limits'}
                    >
                        Read more about limits
                    </Link>
                    <Typography fontWeight='bold'>Limit: {limit}</Typography>
                </LimitExplanation>
            </Main>
            <Footer>
                If you need more than <b>{limit}</b> {shortName ?? name}, please
                reach out to us at{' '}
                <a href='mailto:cs@getunleash.io?subject=Increase limit'>
                    cs@getunleash.io
                </a>
            </Footer>
        </StyledBox>
    );
};
