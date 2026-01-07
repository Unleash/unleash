import { Box, IconButton, styled, Tooltip, Typography } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { Link } from 'react-router-dom';
import WarningIcon from '@mui/icons-material/ErrorOutlined';
import ErrorIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import type { FC } from 'react';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender.tsx';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
    width: '100%',
}));

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadiusMedium,
}));

const StyledWarningIcon = styled(WarningIcon)(({ theme }) => ({
    color: theme.palette.warning.border,
}));

const StyledErrorIcon = styled(ErrorIcon)(({ theme }) => ({
    color: theme.palette.error.main,
}));

const Header = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
    fontWeight: 'bold',
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(3, 4),
    fontSize: theme.typography.h2.fontSize,
}));

const Footer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3, 4),
}));

const Main = styled(Box)(({ theme }) => ({
    borderBottom: `1px solid ${theme.palette.divider}`,
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
    className?: string;
}> = ({ name, shortName, limit, currentValue, onClose, className }) => {
    const { isOss } = useUiConfig();
    const percentageLimit = Math.floor((currentValue / limit) * 100);
    const belowLimit = currentValue < limit;
    const threshold = 80;

    if (percentageLimit < threshold) {
        return null;
    }

    const footerContent = isOss() ? (
        <>
            Need help with resource limits? Try the{' '}
            <a href='https://slack.unleash.run'>Unleash community Slack</a>.
        </>
    ) : (
        <>
            If you need more than <strong>{limit}</strong> {shortName ?? name},
            please reach out to us at{' '}
            <a href='mailto:customersuccess@getunleash.io?subject=Increase limit'>
                customersuccess@getunleash.io
            </a>
        </>
    );

    return (
        <StyledBox className={className}>
            <Header>
                <ConditionallyRender
                    condition={belowLimit}
                    show={<StyledWarningIcon fontSize='large' />}
                    elseShow={<StyledErrorIcon fontSize='large' />}
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
                            You have reached the limit for {name}
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
                    You have added {currentValue} {shortName ?? name}, which is
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
                        to='https://docs.getunleash.io/concepts/resource-limits'
                    >
                        Read more about limits
                    </Link>
                    <Typography fontWeight='bold'>Limit: {limit}</Typography>
                </LimitExplanation>
            </Main>
            <Footer>{footerContent}</Footer>
        </StyledBox>
    );
};
