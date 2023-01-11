import { Alert, styled } from '@mui/material';
import React from 'react';
import { IProjectRole } from 'interfaces/role';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import Input from 'component/common/Input/Input';

interface IProjectRoleDeleteConfirmProps {
    role: IProjectRole;
    open: boolean;
    setDialogue: React.Dispatch<React.SetStateAction<boolean>>;
    handleDeleteRole: (id: number) => Promise<void>;
    confirmName: string;
    setConfirmName: React.Dispatch<React.SetStateAction<string>>;
}

const DeleteParagraph = styled('p')(({ theme }) => ({
    marginTop: theme.spacing(3),
}));

const RoleDeleteInput = styled(Input)(({ theme }) => ({
    marginTop: theme.spacing(2),
}));

const ProjectRoleDeleteConfirm = ({
    role,
    open,
    setDialogue,
    handleDeleteRole,
    confirmName,
    setConfirmName,
}: IProjectRoleDeleteConfirmProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setConfirmName(e.currentTarget.value);

    const handleCancel = () => {
        setDialogue(false);
        setConfirmName('');
    };
    const formId = 'delete-project-role-confirmation-form';
    return (
        <Dialogue
            title="Are you sure you want to delete this role?"
            open={open}
            primaryButtonText="Delete project role"
            secondaryButtonText="Cancel"
            onClick={() => handleDeleteRole(role.id)}
            disabledPrimaryButton={role?.name !== confirmName}
            onClose={handleCancel}
            formId={formId}
        >
            <Alert severity="error">
                Danger. Deleting this role will result in removing all
                permissions that are active in this environment across all
                feature toggles.
            </Alert>

            <DeleteParagraph>
                In order to delete this role, please enter the name of the role
                in the textfield below: <strong>{role?.name}</strong>
            </DeleteParagraph>

            <form id={formId}>
                <RoleDeleteInput
                    autoFocus
                    onChange={handleChange}
                    value={confirmName}
                    label="Role name"
                />
            </form>
        </Dialogue>
    );
};

export default ProjectRoleDeleteConfirm;
