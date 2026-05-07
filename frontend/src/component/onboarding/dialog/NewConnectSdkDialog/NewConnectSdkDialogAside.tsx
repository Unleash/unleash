import { Link, styled, Typography } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GitHubIcon from '@mui/icons-material/GitHub';

const StyledHeader = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    marginBottom: theme.spacing(1.25),
}));

const StyledResourceHeader = styled(Typography)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    marginTop: theme.spacing(2.75),
    marginBottom: theme.spacing(1.75),
}));

const StyledResourceList = styled('ul')(({ theme }) => ({
    padding: 0,
    margin: 0,
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
}));

const StyledResourceLink = styled(Link)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    color: 'inherit',
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    paddingLeft: theme.spacing(1),
    textDecoration: 'none',
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
}));

export const NewConnectSdkDialogAside = () => (
    <>
        <StyledHeader>Why do I need an SDK?</StyledHeader>
        <Typography variant='body2'>
            SDKs serve to bind your application to Unleash. The SDK can connect
            to Unleash via HTTP and retrieve feature flag configuration that is
            then cached in your application. Making sure none of your
            application data ever leaves your servers.
        </Typography>
        <StyledResourceHeader>Other resources</StyledResourceHeader>
        <StyledResourceList>
            <li>
                <StyledResourceLink
                    href='https://docs.getunleash.io/sdks'
                    target='_blank'
                    rel='noreferrer'
                >
                    <MenuBookIcon fontSize='small' />
                    SDK overview
                </StyledResourceLink>
            </li>
            <li>
                <StyledResourceLink
                    href='https://github.com/Unleash/unleash-sdk-examples'
                    target='_blank'
                    rel='noreferrer'
                >
                    <GitHubIcon fontSize='small' />
                    SDK code examples repo
                </StyledResourceLink>
            </li>
        </StyledResourceList>
    </>
);
