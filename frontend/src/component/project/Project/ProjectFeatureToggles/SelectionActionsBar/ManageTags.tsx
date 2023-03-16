import { useState, VFC } from 'react';
import { Label } from '@mui/icons-material';
import { Button } from '@mui/material';
import { DialogUI } from 'component/feature/FeatureView/FeatureOverview/ManageTagsDialog/DialogUI';

interface IManageTagsProps {}

export const ManageTags: VFC<IManageTagsProps> = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        // TODO: permissions UPDATE_FEATURE
        <>
            <Button
                startIcon={<Label />}
                variant="outlined"
                size="small"
                onClick={() => setIsOpen(true)}
            >
                Tags
            </Button>
            <DialogUI
                open={isOpen}
                onCancel={() => setIsOpen(false)}
                onSubmit={() => {}}
            />
        </>
    );
};
