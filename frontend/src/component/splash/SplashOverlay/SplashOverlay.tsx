import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Modal, Backdrop, styled } from '@mui/material';
import Fade from '@mui/material/Fade';
import { useAuthSplash } from 'hooks/api/getters/useAuth/useAuthSplash';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import useSplashApi from 'hooks/api/actions/useSplashApi/useSplashApi';
import {
    activeSplashIds,
    splashIds,
    type SplashId,
} from 'component/splash/splash';
import type { IAuthSplash } from 'hooks/api/getters/useAuth/useAuthEndpoint';
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

    const splashId = searchParams.get('splash');
    const isKnownId = splashId ? isKnownSplashId(splashId) : false;

    useEffect(() => {
        if (!user || !splash || splashId) return;

        if (user.isAPI) return;

        const unseenSplashId = activeSplashIds.find(
            (id) => !hasSeenSplashId(id, splash),
        );

        if (unseenSplashId) {
            searchParams.set('splash', unseenSplashId);
            setSearchParams(searchParams, { replace: true });
        }
    }, [user, splash, splashId, searchParams, setSearchParams]);

    useEffect(() => {
        if (splashId && isKnownId) {
            setSplashSeen(splashId)
                .then(() => refetchSplash())
                .catch(console.warn);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps refetch and setSplashSeen are not stable references
    }, [splashId, isKnownId]);

    const handleClose = () => {
        searchParams.delete('splash');
        setSearchParams(searchParams, { replace: true });
    };

    if (!splashId) return null;

    const getSplashContent = () => {
        switch (splashId) {
            case 'release-management':
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
