import { Link, useNavigate } from 'react-router-dom';
import { Button, IconButton, styled } from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import { OperatorUpgradeAlert } from 'component/common/OperatorUpgradeAlert/OperatorUpgradeAlert';

const StyledContainer = styled('section')(({ theme }) => ({
    backgroundColor: theme.palette.primary.light,
    minHeight: '100vh',
    padding: theme.spacing(2),
    display: 'grid',
    gap: theme.spacing(2),
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    gridTemplateColumns: 'minmax(0,auto)',
    fontWeight: theme.fontWeight.thin,
}));

const StyledContent = styled('div')(({ theme }) => ({
    position: 'relative',
    padding: theme.spacing(4),
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    [theme.breakpoints.up('md')]: {
        padding: theme.spacing(8),
    },
}));

const StyledHeader = styled('header')(({ theme }) => ({
    textAlign: 'center',
}));

const StyledTitle = styled('h1')(({ theme }) => ({
    fontWeight: 'inherit',
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    right: 0,
    color: 'inherit',
}));
const StyledIngress = styled('p')(({ theme }) => ({
    maxWidth: theme.spacing(64),
    margin: theme.spacing(3, 'auto', 0, 'auto'),
}));

const StyledBody = styled('div')(({ theme }) => ({
    margin: theme.spacing(4, 0),
    padding: theme.spacing(4, 0),
    borderTop: '1px solid',
    borderBottom: '1px solid',
    borderTopColor: theme.palette.primary.light,
    borderBottomColor: theme.palette.primary.light,
}));

const StyledList = styled('ul')(({ theme }) => ({
    padding: theme.spacing(2, 0),
    [theme.breakpoints.up('md')]: {
        padding: theme.spacing(2, 4),
    },
    '& li + li': {
        marginTop: theme.spacing(0.5),
    },
    '& strong': {
        padding: theme.spacing(0, 0.5),
        fontSize: theme.fontSizes.smallBody,
        fontWeight: 'inherit',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
}));

const StyledFooter = styled('footer')(({ theme }) => ({
    display: 'grid',
    gap: theme.spacing(4),
    textAlign: 'center',
    justifyItems: 'center',
}));

const StyledLink = styled('a')(({ theme }) => ({
    color: 'inherit',
}));

export const SplashPageOperators = () => {
    const navigate = useNavigate();

    return (
        <StyledContainer>
            <StyledContent>
                <StyledHeader>
                    <StyledTitle>New strategy operators</StyledTitle>
                    <StyledCloseButton
                        onClick={() => navigate('/')}
                        size="large"
                    >
                        <CloseOutlined titleAccess="Close" />
                    </StyledCloseButton>
                    <StyledIngress>
                        We've added some new feature strategy constraint
                        operators. Fine-tune your feature targeting like never
                        before.
                    </StyledIngress>
                </StyledHeader>
                <StyledBody>
                    <p>For example:</p>
                    <StyledList>
                        <li>
                            <span>Toggle features at dates: </span>
                            <span>
                                <strong>DATE_BEFORE</strong>{' '}
                                <strong>DATE_AFTER</strong>
                            </span>
                        </li>
                        <li>
                            <span>Toggle features for versions: </span>
                            <span>
                                <strong>SEMVER_EQ</strong>{' '}
                                <strong>SEMVER_GT</strong>{' '}
                                <strong>SEMVER_LT</strong>
                            </span>
                        </li>
                        <li>
                            <span>Toggle features for strings: </span>
                            <span>
                                <strong>STR_CONTAINS</strong>{' '}
                                <strong>STR_ENDS_WITH</strong>{' '}
                                <strong>STR_STARTS_WITH</strong>
                            </span>
                        </li>
                        <li>
                            <span>Toggle features for numbers: </span>
                            <span>
                                <strong>NUM_GT</strong> <strong>NUM_GTE</strong>{' '}
                                <strong>NUM_LT</strong> <strong>NUM_LTE</strong>
                            </span>
                        </li>
                    </StyledList>
                </StyledBody>
                <StyledFooter>
                    <p>
                        <StyledLink
                            href="https://docs.getunleash.io/reference/strategy-constraints#numeric-operators"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Read all about operators in our in-depth{' '}
                            <strong>docs</strong>
                        </StyledLink>
                        .
                    </p>
                    <p>
                        <Button
                            sx={theme => ({
                                background: 'white !important',
                                color: theme.palette.primary.main,
                            })}
                            variant="contained"
                            component={Link}
                            to="/"
                        >
                            Fine, whatever, I have work to do!
                        </Button>
                    </p>
                </StyledFooter>
            </StyledContent>
            <OperatorUpgradeAlert />
        </StyledContainer>
    );
};
