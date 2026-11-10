import {
    Button,
    type ButtonProps,
    Stack,
    styled,
    Typography,
} from '@mui/material';
import OpenInNew from '@mui/icons-material/OpenInNew';
import { useIntro } from 'component/onboarding/intro/IntroProvider.tsx';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import { OnboardingBanner } from '../OnboardingBanner.tsx';

const StyledButton = styled(Button)<ButtonProps<'a'>>(({ theme }) => ({
    borderColor: theme.palette.divider,
}));

export const NewToUnleashBanner = () => {
    const { open: openIntro } = useIntro();
    const [state, setState] = useLocalStorageState<'open' | 'closed'>(
        'new-to-unleash-banner:v1',
        'open',
    );

    if (state === 'closed') return null;

    return (
        <OnboardingBanner
            title='New to Unleash?'
            onDismiss={() => setState('closed')}
        >
            <Typography
                variant='body2'
                color='text.secondary'
                sx={{ maxWidth: '70ch' }}
            >
                Explore how feature flags work in Unleash. Ask a project owner
                or administrator to give you access to a project so you can view
                or manage its flags.
            </Typography>
            <Stack
                direction='row'
                useFlexGap
                spacing={2}
                sx={{ flexWrap: 'wrap', mt: 1 }}
            >
                <StyledButton
                    variant='outlined'
                    size='medium'
                    onClick={() => openIntro()}
                >
                    Intro tour
                </StyledButton>
                <StyledButton
                    variant='outlined'
                    size='medium'
                    href='https://docs.getunleash.io/'
                    target='_blank'
                    rel='noopener noreferrer'
                    endIcon={<OpenInNew />}
                >
                    Go to docs
                </StyledButton>
                <StyledButton
                    variant='outlined'
                    size='medium'
                    href='https://docs.getunleash.io/get-started/unleash-overview'
                    target='_blank'
                    rel='noopener noreferrer'
                    endIcon={<OpenInNew />}
                >
                    View architecture
                </StyledButton>
            </Stack>
        </OnboardingBanner>
    );
};
