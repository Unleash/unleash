import type React from 'react';
import { useState } from 'react';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import Input from 'component/common/Input/Input';
import type { ISegment } from 'interfaces/segment';
import { SEGMENT_DIALOG_NAME_ID } from 'utils/testIds';
import { Alert, styled } from '@mui/material';

const StyledInput = styled(Input)(({ theme }) => ({
    marginTop: theme.spacing(2),
}));

interface ISegmentDeleteConfirmProps {
    segment: ISegment;
    open: boolean;
    onClose: () => void;
    onRemove: () => void;
}

export const SegmentDeleteConfirm = ({
    segment,
    open,
    onClose,
    onRemove,
}: ISegmentDeleteConfirmProps) => {
    const [confirmName, setConfirmName] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setConfirmName(e.currentTarget.value);

    const handleCancel = () => {
        onClose();
        setConfirmName('');
    };
    const formId = 'delete-segment-confirmation-form';
    return (
        <Dialogue
            title='Are you sure you want to delete this segment?'
            open={open}
            primaryButtonText='Delete segment'
            secondaryButtonText='Cancel'
            onClick={() => {
                onRemove();
                setConfirmName('');
            }}
            disabledPrimaryButton={segment?.name !== confirmName}
            onClose={handleCancel}
            formId={formId}
        >
            <Alert sx={{ marginBottom: 2 }} severity='warning'>
                Deleted segments may be referenced in strategies if the feature
                flag is archived. Removing the segment will also remove the
                segments from strategies of archived flags.
            </Alert>
            <p>
                In order to delete this segment, please enter the name of the
                segment in the field below: <strong>{segment?.name}</strong>
            </p>

            <form id={formId}>
                <StyledInput
                    autoFocus
                    onChange={handleChange}
                    value={confirmName}
                    label='Segment name'
                    data-testid={SEGMENT_DIALOG_NAME_ID}
                />
            </form>
        </Dialogue>
    );
};
