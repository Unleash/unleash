import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Modal, Backdrop, styled } from '@mui/material';
import Fade from '@mui/material/Fade';
import { useFlag } from '@unleash/proxy-client-react';
import { useAuthSplash } from 'hooks/api/getters/useAuth/useAuthSplash';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import useSplashApi from 'hooks/api/actions/useSplashApi/useSplashApi';
import { splashIds, type SplashId } from 'component/splash/splash';
import type { IAuthSplash } from 'hooks/api/getters/useAuth/useAuthEndpoint';
import { ReleaseManagementSplash } from './ReleaseManagementSplash';

const splashFlags: Partial<Record<SplashId, string>> = {
    'release-management-v3': 'releaseManagementV3Splash',
};

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

const hasSeenSplashId = (splashId: SplashId, splash: IAuthSplash): boolean => {
    return Boolean(splash[splashId]);
};

const isKnownSplashId = (value: string): value is SplashId => {
    return (splashIds as Readonly<string[]>).includes(value);
};

export const SplashOverlay = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuthUser();
    const { splash, refetchSplash } = useAuthSplash();
    const { setSplashSeen } = useSplashApi();

    const closedSplashesRef = useRef<Set<string>>(new Set());

    const releaseManagementV3Flag = useFlag('releaseManagementV3Splash');

    const flagValues: Record<string, boolean> = {
        releaseManagementV3Splash: releaseManagementV3Flag,
    };

    const splashId = searchParams.get('splash');
    const isKnownId = splashId ? isKnownSplashId(splashId) : false;

    useEffect(() => {
        if (!user || !splash || splashId) return;

        if (user.isAPI) return;

        // Find first unseen splash that has its feature flag enabled
        // and hasn't been closed this session
        const unseenSplashId = splashIds.find((id) => {
            if (closedSplashesRef.current.has(id)) return false;
            const flagName = splashFlags[id];
            if (!flagName || !flagValues[flagName]) return false;
            return !hasSeenSplashId(id, splash);
        });

        if (unseenSplashId) {
            searchParams.set('splash', unseenSplashId);
            setSearchParams(searchParams, { replace: true });
        }
    }, [
        user,
        splash,
        splashId,
        searchParams,
        setSearchParams,
        releaseManagementV3Flag,
    ]);

    const handleClose = () => {
        const currentSplashId = splashId;
        const currentIsKnownId = isKnownId;

        if (currentSplashId) {
            closedSplashesRef.current.add(currentSplashId);
        }

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
