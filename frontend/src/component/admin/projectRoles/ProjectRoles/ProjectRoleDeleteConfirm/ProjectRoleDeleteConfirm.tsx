import { Alert } from '@mui/material';
import React from 'react';
import { IProjectRole } from 'interfaces/role';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import Input from 'component/common/Input/Input';
import { useStyles } from './ProjectRoleDeleteConfirm.styles';

interface IProjectRoleDeleteConfirmProps {
    role: IProjectRole;
    open: boolean;
    setDeldialogue: React.Dispatch<React.SetStateAction<boolean>>;
    handleDeleteRole: (id: number) => Promise<void>;
    confirmName: string;
    setConfirmName: React.Dispatch<React.SetStateAction<string>>;
}

const ProjectRoleDeleteConfirm = ({
    role,
    open,
    setDeldialogue,
    handleDeleteRole,
    confirmName,
    setConfirmName,
}: IProjectRoleDeleteConfirmProps) => {
    const { classes: styles } = useStyles();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setConfirmName(e.currentTarget.value);

    const handleCancel = () => {
        setDeldialogue(false);
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

            <p className={styles.deleteParagraph}>
                In order to delete this role, please enter the name of the role
                in the textfield below: <strong>{role?.name}</strong>
            </p>

            <form id={formId}>
                <Input
                    autoFocus
                    onChange={handleChange}
                    value={confirmName}
                    label="Role name"
                    className={styles.roleDeleteInput}
                />
            </form>
        </Dialogue>
    );
};

export default ProjectRoleDeleteConfirm;
