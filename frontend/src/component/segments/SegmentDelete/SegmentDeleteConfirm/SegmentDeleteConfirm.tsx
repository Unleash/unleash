import React, { useState } from 'react';
import Dialogue from 'component/common/Dialogue';
import Input from 'component/common/Input/Input';
import { useStyles } from './SegmentDeleteConfirm.styles';
import { ISegment } from 'interfaces/segment';
import { SEGMENT_DIALOG_NAME_ID } from 'utils/testIds';

interface ISegmentDeleteConfirmProps {
    segment: ISegment;
    open: boolean;
    setDeldialogue: React.Dispatch<React.SetStateAction<boolean>>;
    handleDeleteSegment: (id: number) => Promise<void>;
}

export const SegmentDeleteConfirm = ({
    segment,
    open,
    setDeldialogue,
    handleDeleteSegment,
}: ISegmentDeleteConfirmProps) => {
    const styles = useStyles();
    const [confirmName, setConfirmName] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setConfirmName(e.currentTarget.value);

    const handleCancel = () => {
        setDeldialogue(false);
        setConfirmName('');
    };
    const formId = 'delete-segment-confirmation-form';
    return (
        <Dialogue
            title="Are you sure you want to delete this segment?"
            open={open}
            primaryButtonText="Delete segment"
            secondaryButtonText="Cancel"
            onClick={() => {
                handleDeleteSegment(segment.id);
                setConfirmName('');
            }}
            disabledPrimaryButton={segment?.name !== confirmName}
            onClose={handleCancel}
            formId={formId}
        >
            <p className={styles.deleteParagraph}>
                In order to delete this segment, please enter the name of the
                segment in the textfield below: <strong>{segment?.name}</strong>
            </p>

            <form id={formId}>
                <Input
                    autoFocus
                    onChange={handleChange}
                    value={confirmName}
                    label="Segment name"
                    className={styles.deleteInput}
                    data-test={SEGMENT_DIALOG_NAME_ID}
                />
            </form>
        </Dialogue>
    );
};
