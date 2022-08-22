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
    width: '100%',
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
                title: 'Feature toggle deleted',
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
            title="Delete feature toggle?"
            open={open}
            primaryButtonText="Delete feature toggle"
            secondaryButtonText="Cancel"
            onClick={onDeleteFeatureToggle}
            onClose={clearModal}
            disabledPrimaryButton={deletedFeature?.name !== confirmName}
            formId={formId}
        >
            <Alert severity="warning">
                <b>Warning!</b> Before you delete a feature toggle, make sure
                all in-code references to that feature toggle have been removed.
                Otherwise, a new feature toggle with the same name could
                activate the old code paths.
            </Alert>

            <StyledDeleteParagraph>
                In order to delete this feature toggle, please enter its name in
                the text field below:
                <br />
                <strong>{deletedFeature?.name}</strong>
            </StyledDeleteParagraph>

            <form id={formId}>
                <StyledFormInput
                    autoFocus
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setConfirmName(e.currentTarget.value);
                    }}
                    value={confirmName}
                    placeholder="<feature toggle name>"
                    label="Feature toggle name"
                />
            </form>
        </Dialogue>
    );
};
