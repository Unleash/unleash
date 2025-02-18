import type { FC } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';

const StyledAddTagButton = styled(PermissionButton)(({ theme }) => ({
    lineHeight: theme.typography.body1.lineHeight,
    borderRadius: theme.shape.borderRadiusExtraLarge,
    background: theme.palette.secondary.light,
    padding: theme.spacing(0.5, 1),
    height: theme.spacing(3.5),
}));

const StyledAddIcon = styled(AddIcon)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
}));

type AddTagButtonProps = {
    project: string;
    onClick: () => void;
};

export const AddTagButton: FC<AddTagButtonProps> = ({ project, onClick }) => (
    <StyledAddTagButton
        size='small'
        permission={UPDATE_FEATURE}
        projectId={project}
        variant='text'
        onClick={onClick}
        startIcon={<StyledAddIcon />}
    >
        Add tag
    </StyledAddTagButton>
);
