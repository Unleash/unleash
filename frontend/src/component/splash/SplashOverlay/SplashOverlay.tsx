import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Modal, Backdrop, styled } from '@mui/material';
import Fade from '@mui/material/Fade';
import { useFlag } from '@unleash/proxy-client-react';
import { useAuthSplash } from 'hooks/api/getters/useAuth/useAuthSplash';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import useSplashApi from 'hooks/api/actions/useSplashApi/useSplashApi';
import { splashIds, type SplashId } from 'component/splash/splash';
import { ReleaseManagementSplash } from './ReleaseManagementSplash';

const TRANSITION_DURATION = 250;

const StyledBackdrop = styled(Backdrop)({
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
});

const ModalContent = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    outline: 'none',
});

const isKnownSplashId = (value: string): value is SplashId => {
    return (splashIds as Readonly<string[]>).includes(value);
};

export const SplashOverlay = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuthUser();
    const { splash, refetchSplash } = useAuthSplash();
    const { setSplashSeen } = useSplashApi();

    const [closedSplash, setClosedSplash] = useState(false);

    const releaseManagementV3Enabled = useFlag('releaseManagementV3Splash');

    const splashId = searchParams.get('splash');
    const isKnownId = splashId ? isKnownSplashId(splashId) : false;

    useEffect(() => {
        if (!user || !splash || splashId || user.isAPI || closedSplash) return;

        const hasSeenReleaseManagementV3 = Boolean(
            splash['release-management-v3'],
        );

        if (releaseManagementV3Enabled && !hasSeenReleaseManagementV3) {
            searchParams.set('splash', 'release-management-v3');
            setSearchParams(searchParams, { replace: true });
        }
    }, [
        user,
        splash,
        splashId,
        searchParams,
        setSearchParams,
        releaseManagementV3Enabled,
        closedSplash,
    ]);

    const handleClose = () => {
        const currentSplashId = splashId;
        const currentIsKnownId = isKnownId;

        setClosedSplash(true);

        searchParams.delete('splash');
        setSearchParams(searchParams, { replace: true });

        if (currentSplashId && currentIsKnownId) {
            setSplashSeen(currentSplashId)
                .then(() => refetchSplash())
                .catch(console.warn);
        }
    };

    if (!splashId) return null;

    const getSplashContent = () => {
        switch (splashId) {
            case 'release-management-v3':
                return <ReleaseManagementSplash onClose={handleClose} />;
            default:
                return null;
        }
    };

    const content = getSplashContent();
    if (!content) return null;

    return (
        <Modal
            open={Boolean(splashId)}
            onClose={handleClose}
            closeAfterTransition
            slots={{ backdrop: StyledBackdrop }}
            slotProps={{ backdrop: { timeout: TRANSITION_DURATION } }}
            sx={{ zIndex: (theme) => theme.zIndex.modal }}
        >
            <Fade timeout={TRANSITION_DURATION} in={Boolean(splashId)}>
                <ModalContent>{content}</ModalContent>
            </Fade>
        </Modal>
    );
};
