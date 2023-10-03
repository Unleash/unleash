import { styled, Typography } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import CheckIcon from '@mui/icons-material/Check';

interface IPasswordMatcherProps {
    started: boolean;
    matchingPasswords: boolean;
}

const StyledMatcherContainer = styled('div')(({ theme }) => ({
    position: 'relative',
    paddingTop: theme.spacing(0.5),
}));

const StyledMatcher = styled(Typography, {
    shouldForwardProp: prop => prop !== 'matchingPasswords',
})<{ matchingPasswords: boolean }>(({ theme, matchingPasswords }) => ({
    position: 'absolute',
    bottom: '-8px',
    display: 'flex',
    alignItems: 'center',
    color: matchingPasswords
        ? theme.palette.primary.main
        : theme.palette.error.main,
}));

const StyledMatcherCheckIcon = styled(CheckIcon)(({ theme }) => ({
    marginRight: '5px',
}));

const PasswordMatcher = ({
    started,
    matchingPasswords,
}: IPasswordMatcherProps) => {
    return (
        <StyledMatcherContainer>
            <ConditionallyRender
                condition={started}
                show={
                    <StyledMatcher
                        variant="body2"
                        data-loading
                        matchingPasswords={matchingPasswords}
                    >
                        <StyledMatcherCheckIcon />{' '}
                        <ConditionallyRender
                            condition={matchingPasswords}
                            show={<Typography> Passwords match</Typography>}
                            elseShow={
                                <Typography> Passwords do not match</Typography>
                            }
                        />
                    </StyledMatcher>
                }
            />
        </StyledMatcherContainer>
    );
};

export default PasswordMatcher;
