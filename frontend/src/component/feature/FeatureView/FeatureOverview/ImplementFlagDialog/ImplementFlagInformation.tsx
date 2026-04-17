import { IconButton, Link, styled, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GitHubIcon from '@mui/icons-material/GitHub';

const Container = styled('aside')(({ theme }) => ({
    backgroundColor: theme.palette.background.sidebar,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(3, 4),
    width: 320,
    flexGrow: 0,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    position: 'relative',
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    color: theme.palette.primary.contrastText,
}));

const InlineLink = styled(Link)(({ theme }) => ({
    color: theme.palette.primary.contrastText,
    textDecoration: 'underline',
}));

const ResourceList = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
}));

const ResourceLink = styled(Link)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    color: theme.palette.primary.contrastText,
    fontWeight: theme.typography.fontWeightBold,
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
    textDecoration: 'none',
    '&:hover': {
        textDecoration: 'underline',
    },
}));

interface ImplementFlagInformationProps {
    onClose: () => void;
}

export const ImplementFlagInformation = ({
    onClose,
}: ImplementFlagInformationProps) => (
    <Container>
        <CloseButton onClick={onClose} size='small'>
            <CloseIcon />
        </CloseButton>
        <Typography variant='body2' fontWeight='bold' sx={{ mt: 4 }}>
            Define a safe default value
        </Typography>
        <Typography variant='body2'>
            When wrapping code in a feature flag evaluation, always provide an
            explicit fallback value (typically false) so your application
            behaves predictably if the flag can't be resolved. Evaluate the flag
            once at the highest level of your stack and pass the result
            downstream.
        </Typography>
        <Typography variant='body2'>
            For exceptions and advanced patterns, see{' '}
            <InlineLink
                href='https://docs.getunleash.io/guides/manage-feature-flags-in-code'
                target='_blank'
                rel='noreferrer'
            >
                Managing feature flags in code.
            </InlineLink>
        </Typography>
        <Typography variant='body1' fontWeight='bold' sx={{ mt: 3 }}>
            Other resources
        </Typography>
        <ResourceList>
            <ResourceLink
                href='https://docs.getunleash.io/guides/best-practices-using-feature-flags-at-scale'
                target='_blank'
                rel='noreferrer'
            >
                <MenuBookIcon fontSize='small' />
                Feature flag best practices
            </ResourceLink>
            <ResourceLink
                href='https://github.com/Unleash/unleash-sdk-examples'
                target='_blank'
                rel='noreferrer'
            >
                <GitHubIcon fontSize='small' />
                SDK code examples repo
            </ResourceLink>
        </ResourceList>
    </Container>
);
