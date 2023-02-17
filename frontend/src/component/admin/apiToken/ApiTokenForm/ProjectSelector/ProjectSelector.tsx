import { SelectProjectInput } from './SelectProjectInput/SelectProjectInput';
import { TokenType } from '../../../../../interfaces/token';
import React from 'react';
import { StyledInputDescription } from '../ApiTokenForm.styles';
import useProjects from '../../../../../hooks/api/getters/useProjects/useProjects';
import { ApiTokenFormErrorType } from '../useApiTokenForm';
import { useOptionalPathParam } from '../../../../../hooks/useOptionalPathParam';

interface IProjectSelectorProps {
    type: string;
    projects: string[];
    setProjects: React.Dispatch<React.SetStateAction<string[]>>;
    errors: { [key: string]: string };
    clearErrors: (error?: ApiTokenFormErrorType) => void;
}
export const ProjectSelector = ({
    type,
    projects,
    setProjects,
    errors,
    clearErrors,
}: IProjectSelectorProps) => {
    const projectId = useOptionalPathParam('projectId');
    const { projects: availableProjects } = useProjects();

    const selectableProjects = availableProjects.map(project => ({
        value: project.id,
        label: project.name,
    }));

    if (projectId) {
        return null;
    }

    return (
        <>
            <StyledInputDescription>
                Which project do you want to give access to?
            </StyledInputDescription>
            <SelectProjectInput
                disabled={type === TokenType.ADMIN}
                options={selectableProjects}
                defaultValue={projects}
                onChange={setProjects}
                error={errors?.projects}
                onFocus={() => clearErrors('projects')}
            />
        </>
    );
};
