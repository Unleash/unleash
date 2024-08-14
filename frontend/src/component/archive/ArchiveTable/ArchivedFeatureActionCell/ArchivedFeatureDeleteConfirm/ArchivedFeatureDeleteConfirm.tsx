import { Alert, styled } from '@mui/material';
import type React from 'react';
import { useState } from 'react';
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

    const singularOrPluralFlags = deletedFeatures.length > 1 ? 'flags' : 'flag';

    const onDeleteFeatureToggle = async () => {
        try {
            if (deletedFeatures.length === 0) {
                return;
            }
            await deleteFeatures(projectId, deletedFeatures);

            await refetch();
            setToastData({
                type: 'success',
                title: `Feature ${singularOrPluralFlags} deleted`,
                text: `You have successfully deleted the following feature ${singularOrPluralFlags}: ${deletedFeatures.join(
                    ', ',
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
            title={`Delete feature ${singularOrPluralFlags}?`}
            open={open}
            primaryButtonText={`Delete feature ${singularOrPluralFlags}`}
            secondaryButtonText='Cancel'
            onClick={onDeleteFeatureToggle}
            onClose={clearModal}
            disabledPrimaryButton={confirmationText !== confirmName}
            formId={formId}
        >
            <Alert severity='warning'>
                <b>Warning!</b> Before you delete a feature flag, make sure all
                in-code references to that feature flag have been removed.
                Otherwise, a new feature flag with the same name could activate
                the old code paths.
            </Alert>

            <StyledDeleteParagraph>
                You are about to delete the following feature{' '}
                {singularOrPluralFlags}:{' '}
                <strong>{deletedFeatures.join(', ')}</strong>.
            </StyledDeleteParagraph>

            <StyledDeleteParagraph
                sx={(theme) => ({ marginTop: theme.spacing(2) })}
            >
                In order to delete the feature {singularOrPluralFlags}, please
                enter the following confirmation text in the text field below:{' '}
                <strong>I want to delete</strong>
            </StyledDeleteParagraph>

            <form id={formId}>
                <StyledFormInput
                    autoFocus
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setConfirmName(e.currentTarget.value);
                    }}
                    value={confirmName}
                    placeholder='<deletion confirmation>'
                    label='Deletion confirmation'
                />
            </form>
        </Dialogue>
    );
};
