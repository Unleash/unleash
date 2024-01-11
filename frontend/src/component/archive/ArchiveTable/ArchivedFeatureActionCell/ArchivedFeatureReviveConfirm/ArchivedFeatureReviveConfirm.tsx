import { Alert, styled } from '@mui/material';
import React from 'react';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface IArchivedFeatureReviveConfirmProps {
    revivedFeatures: string[];
    projectId: string;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
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
    refetch,
}: IArchivedFeatureReviveConfirmProps) => {
    const { setToastData, setToastApiError } = useToast();
    const { reviveFeatures } = useProjectApi();

    const onReviveFeatureToggle = async () => {
        try {
            if (revivedFeatures.length === 0) {
                return;
            }
            await reviveFeatures(projectId, revivedFeatures);

            await refetch();
            setToastData({
                type: 'success',
                title: "And we're back!",
                text: 'The feature toggles have been revived.',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            clearModal();
        }
    };

    const clearModal = () => {
        setOpen(false);
    };

    const title = `Revive feature toggle${
        revivedFeatures.length > 1 ? 's' : ''
    }?`;
    const primaryBtnText = `Revive feature toggle${
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
        >
            <Alert severity='info'>
                Revived feature toggles will be automatically disabled in all
                environments
            </Alert>

            <ConditionallyRender
                condition={revivedFeatures.length > 1}
                show={
                    <>
                        <StyledParagraph>
                            You are about to revive feature toggles:
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
                        You are about to revive feature toggle:{' '}
                        {revivedFeatures[0]}
                    </StyledParagraph>
                }
            />
        </Dialogue>
    );
};
