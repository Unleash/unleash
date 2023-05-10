import { Alert, styled } from '@mui/material';
import React, { useState } from 'react';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import Input from 'component/common/Input/Input';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';

interface IArchivedFeatureDeleteConfirmProps {
    deletedFeatures: string[];
    projectId: string;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    refetch: () => void;
}

const StyledDeleteParagraph = styled('p')(({ theme }) => ({
    marginTop: theme.spacing(3),
}));

const StyledFormInput = styled(Input)(({ theme }) => ({
    marginTop: theme.spacing(2),
    width: '100%',
}));

const confirmationText = 'I want to delete';

export const ArchivedFeatureDeleteConfirm = ({
    deletedFeatures,
    projectId,
    open,
    setOpen,
    refetch,
}: IArchivedFeatureDeleteConfirmProps) => {
    const [confirmName, setConfirmName] = useState('');
    const { setToastData, setToastApiError } = useToast();
    const { deleteFeatures } = useProjectApi();

    const onDeleteFeatureToggle = async () => {
        try {
            if (deletedFeatures.length === 0) {
                return;
            }
            await deleteFeatures(projectId, deletedFeatures);

            await refetch();
            setToastData({
                type: 'success',
                title: 'Feature toggles deleted',
                text: `You have successfully deleted following features toggles: ${deletedFeatures.join(
                    ', '
                )}.`,
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
            title="Delete feature toggles?"
            open={open}
            primaryButtonText="Delete feature toggles"
            secondaryButtonText="Cancel"
            onClick={onDeleteFeatureToggle}
            onClose={clearModal}
            disabledPrimaryButton={confirmationText !== confirmName}
            formId={formId}
        >
            <Alert severity="warning">
                <b>Warning!</b> Before you delete a feature toggle, make sure
                all in-code references to that feature toggle have been removed.
                Otherwise, a new feature toggle with the same name could
                activate the old code paths.
            </Alert>

            <StyledDeleteParagraph>
                In order to delete feature toggles, please enter the following
                confirmation text in the text field below:{' '}
                <strong>I want to delete</strong>
            </StyledDeleteParagraph>

            <form id={formId}>
                <StyledFormInput
                    autoFocus
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setConfirmName(e.currentTarget.value);
                    }}
                    value={confirmName}
                    placeholder="<deletion confirmation>"
                    label="Deletion confirmation"
                />
            </form>
        </Dialogue>
    );
};
