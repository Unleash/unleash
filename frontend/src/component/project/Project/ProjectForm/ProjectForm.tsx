import PermissionButton from '../../../common/PermissionButton/PermissionButton';
import { CREATE_PROJECT } from '../../../providers/AccessProvider/permissions';
import Input from '../../../common/Input/Input';
import { TextField, Button } from '@material-ui/core';
import { useStyles } from './ProjectForm.style';
import React from 'react';
import { trim } from '../../../common/util';

interface IProjectForm {
    projectId: string;
    projectName: string;
    projectDesc: string;
    setProjectId: React.Dispatch<React.SetStateAction<string>>;
    setProjectName: React.Dispatch<React.SetStateAction<string>>;
    setProjectDesc: React.Dispatch<React.SetStateAction<string>>;
    handleSubmit: (e: any) => void;
    handleCancel: () => void;
    errors: { [key: string]: string };
    submitButtonText: string;
    clearErrors: () => void;
    validateIdUniqueness: () => void;
}

const ProjectForm = ({
    handleSubmit,
    handleCancel,
    projectId,
    projectName,
    projectDesc,
    setProjectId,
    setProjectName,
    setProjectDesc,
    errors,
    submitButtonText,
    validateIdUniqueness,
    clearErrors,
}: IProjectForm) => {
    const styles = useStyles();

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h3 className={styles.formHeader}>Project Information</h3>

            <div className={styles.container}>
                <p className={styles.inputDescription}>
                    What is your project Id?
                </p>
                <Input
                    className={styles.input}
                    label="Project Id"
                    value={projectId}
                    onChange={e => setProjectId(trim(e.target.value))}
                    error={Boolean(errors.id)}
                    errorText={errors.id}
                    onFocus={() => clearErrors()}
                    onBlur={validateIdUniqueness}
                    disabled={submitButtonText === 'Edit'}
                />

                <p className={styles.inputDescription}>
                    What is your project name?
                </p>
                <Input
                    className={styles.input}
                    label="Project name"
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    error={Boolean(errors.name)}
                    errorText={errors.name}
                    onFocus={() => clearErrors()}
                />

                <p className={styles.inputDescription}>
                    What is your project description?
                </p>
                <TextField
                    className={styles.input}
                    label="Project description"
                    variant="outlined"
                    multiline
                    maxRows={4}
                    value={projectDesc}
                    onChange={e => setProjectDesc(e.target.value)}
                />
            </div>

            <div className={styles.buttonContainer}>
                <Button onClick={handleCancel} className={styles.cancelButton}>
                    Cancel
                </Button>
                <PermissionButton
                    onClick={handleSubmit}
                    permission={CREATE_PROJECT}
                    type="submit"
                >
                    {submitButtonText} project
                </PermissionButton>
            </div>
        </form>
    );
};

export default ProjectForm;
