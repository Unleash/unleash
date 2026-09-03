import { Alert, styled } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import type { Tracking } from 'utils/trackingEvents';
import { useTracking } from 'hooks/useTracking';

interface IArchivedFeatureReviveConfirmProps {
    revivedFeatures: string[];
    projectId: string;
    open: boolean;
    setOpen: (open: boolean) => void;
    tracking?: Tracking;
    refetch: () => void;
}

const StyledParagraph = styled('p')(({ theme }) => ({
    marginTop: theme.spacing(2),
}));

export const ArchivedFeatureReviveConfirm = ({
    revivedFeatures,
    projectId,
    open,
    setOpen,
    tracking,
    refetch,
}: IArchivedFeatureReviveConfirmProps) => {
    const { setToastData, setToastApiError } = useToast();
    const { reviveFeatures, loading: reviveFeaturesLoading } = useProjectApi();
    const { project, loading } = useProjectOverview(projectId);
    const { trackMutation, trackValidationFailed } = useTracking(tracking);

    const onReviveFeatureToggle = async () => {
        try {
            if (revivedFeatures.length === 0) {
                trackValidationFailed();
                return;
            }
            await trackMutation(() =>
                reviveFeatures(projectId, revivedFeatures),
            );
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
            return;
        } finally {
            clearModal();
        }

        // Revive already succeeded; a refetch failure is not a failed revive.
        try {
            await refetch();
            setToastData({
                type: 'success',
                text: 'Feature flags revived',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const clearModal = () => {
        setOpen(false);
    };

    const title = `Revive feature flag${
        revivedFeatures.length > 1 ? 's' : ''
    }?`;
    const primaryBtnText = `Revive feature flag${
        revivedFeatures.length > 1 ? 's' : ''
    }`;

    return (
        <Dialogue
            title={title}
            open={open}
            primaryButtonText={primaryBtnText}
            secondaryButtonText='Cancel'
            onClick={onReviveFeatureToggle}
            onClose={clearModal}
            disabledPrimaryButton={
                loading || reviveFeaturesLoading || Boolean(project.archivedAt)
            }
            tracking={tracking}
        >
            <ConditionallyRender
                condition={Boolean(project.archivedAt)}
                show={
                    <Alert severity='warning'>
                        Cannot revive feature flag in archived project (Project
                        ID: {projectId})
                    </Alert>
                }
                elseShow={
                    <Alert severity='info'>
                        Revived feature flags will be automatically disabled in
                        all environments
                    </Alert>
                }
            />

            <ConditionallyRender
                condition={revivedFeatures.length > 1}
                show={
                    <>
                        <StyledParagraph>
                            You are about to revive feature flags:
                        </StyledParagraph>
                        <ul>
                            {revivedFeatures.map((name) => (
                                <li key={`revive-${name}`}>{name}</li>
                            ))}
                        </ul>
                    </>
                }
                elseShow={
                    <StyledParagraph>
                        You are about to revive feature flag:{' '}
                        {revivedFeatures[0]}
                    </StyledParagraph>
                }
            />
        </Dialogue>
    );
};
