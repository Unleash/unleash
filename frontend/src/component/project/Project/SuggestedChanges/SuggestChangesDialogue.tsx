import { Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { useGroupApi } from 'hooks/api/actions/useGroupApi/useGroupApi';
import { useGroups } from 'hooks/api/getters/useGroups/useGroups';
import useToast from 'hooks/useToast';
import { IGroup } from 'interfaces/group';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatUnknownError } from 'utils/formatUnknownError';

interface ISuggestChangesDialogueProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    change: any;
}

export const SuggestChangesDialogue: FC<ISuggestChangesDialogueProps> = ({
    open,
    setOpen,
    change,
}) => {
    const { setToastData, setToastApiError } = useToast();
    const navigate = useNavigate();

    const onSuggestClick = async () => {
        try {
            alert('Suggesting changes');
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <Dialogue
            open={open}
            primaryButtonText="Add to draft"
            secondaryButtonText="Cancel"
            onClick={onSuggestClick}
            onClose={() => {
                setOpen(false);
            }}
            title="Suggest changes"
        >
            <Typography>
                <strong>Enable</strong> feature toggle{' '}
                <strong>bestToggle</strong> in production
            </Typography>
        </Dialogue>
    );
};
