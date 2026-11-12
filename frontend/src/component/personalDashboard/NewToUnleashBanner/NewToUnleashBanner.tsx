import {
    Button,
    type ButtonProps,
    Stack,
    styled,
    Typography,
} from '@mui/material';
import OpenInNew from '@mui/icons-material/OpenInNew';
import { useIntro } from 'component/onboarding/intro/IntroProvider.tsx';
import { useState } from 'react';
import { useAuthSplash } from 'hooks/api/getters/useAuth/useAuthSplash';
import useSplashApi from 'hooks/api/actions/useSplashApi/useSplashApi';
import { OnboardingBanner } from '../OnboardingBanner.tsx';

const StyledButton = styled(Button)<ButtonProps<'a'>>(({ theme }) => ({
    borderColor: theme.palette.divider,
}));

const NEW_TO_UNLEASH_BANNER_SPLASH_ID = 'new-to-unleash-banner';

export const NewToUnleashBanner = () => {
    const { splash, refetchSplash } = useAuthSplash();
    const { setSplashSeen } = useSplashApi();
    const [dismissed, setDismissed] = useState(false);

    if (!splash || dismissed || splash[NEW_TO_UNLEASH_BANNER_SPLASH_ID]) {
        return null;
    }

    const onDismiss = () => {
        setDismissed(true);
        setSplashSeen(NEW_TO_UNLEASH_BANNER_SPLASH_ID).then(refetchSplash);
    };

    return <NewToUnleashBannerView onDismiss={onDismiss} />;
};

export const NewToUnleashBannerView = ({
    onDismiss,
}: {
    onDismiss: () => void;
}) => {
    const { open: openIntro } = useIntro();

    return (
        <OnboardingBanner title='New to Unleash?' onDismiss={onDismiss}>
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
