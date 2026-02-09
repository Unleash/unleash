import { useState, useEffect } from 'react';
import { TextField, styled } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';

const StyledForm = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

interface IAddMilestoneDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (milestoneName: string) => void;
    title?: string;
    existingMilestoneCount?: number;
}

export const AddMilestoneDialog = ({
    open,
    onClose,
    onConfirm,
    title = 'Add milestone',
    existingMilestoneCount = 0,
}: IAddMilestoneDialogProps) => {
    const defaultName = `Milestone ${existingMilestoneCount + 1}`;
    const [milestoneName, setMilestoneName] = useState(defaultName);

    // Reset milestone name when dialog opens or count changes
    useEffect(() => {
        if (open) {
            setMilestoneName(defaultName);
        }
    }, [open, defaultName]);

    const handleConfirm = () => {
        onConfirm(milestoneName || defaultName);
        setMilestoneName('');
    };

    const handleClose = () => {
        setMilestoneName('');
        onClose();
    };

    return (
        <Dialogue
            title={title}
            open={open}
            primaryButtonText='Add milestone'
            secondaryButtonText='Cancel'
            onClick={handleConfirm}
            onClose={handleClose}
            disabledPrimaryButton={!milestoneName.trim()}
        >
            <StyledForm>
                <TextField
                    label='Milestone name'
                    value={milestoneName}
                    onChange={(e) => setMilestoneName(e.target.value)}
                    placeholder={defaultName}
                    autoFocus
                    fullWidth
                    size='small'
                />
                <p>
                    Create a milestone to organize your rollout strategy. You
                    can add strategies to this milestone after creation.
                </p>
            </StyledForm>
        </Dialogue>
    );
};
