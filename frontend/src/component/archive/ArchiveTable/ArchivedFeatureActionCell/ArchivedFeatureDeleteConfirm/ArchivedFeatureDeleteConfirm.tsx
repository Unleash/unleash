import { Alert, styled } from '@mui/material';
import React, { useState } from 'react';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import Input from 'component/common/Input/Input';
import { IFeatureToggle } from 'interfaces/featureToggle';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useFeatureArchiveApi } from 'hooks/api/actions/useFeatureArchiveApi/useReviveFeatureApi';
import useToast from 'hooks/useToast';

interface IArchivedFeatureDeleteConfirmProps {
    deletedFeature?: IFeatureToggle;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    refetch: () => void;
}

const StyledDeleteParagraph = styled('p')(({ theme }) => ({
    marginTop: theme.spacing(4),
}));

const StyledFormInput = styled(Input)(({ theme }) => ({
    marginTop: theme.spacing(2),
}));

export const ArchivedFeatureDeleteConfirm = ({
    deletedFeature,
    open,
    setOpen,
    refetch,
}: IArchivedFeatureDeleteConfirmProps) => {
    const [confirmName, setConfirmName] = useState('');
    const { setToastData, setToastApiError } = useToast();
    const { deleteFeature } = useFeatureArchiveApi();

    const onDeleteFeatureToggle = async () => {
        try {
            if (!deletedFeature) {
                return;
            }
            await deleteFeature(deletedFeature.name);
            await refetch();
            setToastData({
                type: 'success',
                title: 'Feature deleted',
                text: `You have successfully deleted the ${deletedFeature.name} feature toggle.`,
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            clearModal();
        }
    };

    const clearModal = () => {
        setOpen(false);
        setConfirmName('');
    };

    const formId = 'delete-feature-toggle-confirmation-form';

    return (
        <Dialogue
            title="Are you sure you want to delete this feature toggle?"
            open={open}
            primaryButtonText="Delete feature toggle"
            secondaryButtonText="Cancel"
            onClick={onDeleteFeatureToggle}
            onClose={clearModal}
            disabledPrimaryButton={deletedFeature?.name !== confirmName}
            formId={formId}
        >
            <Alert severity="warning">
                Warning! To safely delete a feature toggle you might want to
                delete the related code in your application first. This ensures
                you avoid any errors in case you create a new feature toggle
                with the same name in the future.
            </Alert>

            <StyledDeleteParagraph>
                In order to delete this feature toggle, please enter the name of
                the toggle in the textfield below:{' '}
                <strong>{deletedFeature?.name}</strong>
            </StyledDeleteParagraph>

            <form id={formId}>
                <StyledFormInput
                    autoFocus
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setConfirmName(e.currentTarget.value);
                    }}
                    value={confirmName}
                    label="Feature toggle name"
                />
            </form>
        </Dialogue>
    );
};
