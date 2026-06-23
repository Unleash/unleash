import { SelectProjectInput } from './SelectProjectInput/SelectProjectInput.tsx';
import { TokenType } from '../../../../../interfaces/token.ts';
import type React from 'react';
import { FormField } from 'component/common/FormField/FormField';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import type { ApiTokenFormErrorType } from '../useApiTokenForm.ts';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam';

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

    const selectableProjects = availableProjects.map((project) => ({
        value: project.id,
        label: project.name,
    }));

    if (projectId) {
        return null;
    }

    return (
        <FormField
            label='Projects'
            description='Which projects do you want to give access to?'
        >
            <SelectProjectInput
                disabled={type === TokenType.ADMIN}
                options={selectableProjects}
                defaultValue={projects}
                onChange={setProjects}
                error={errors?.projects}
                onFocus={() => clearErrors('projects')}
            />
        </FormField>
    );
};
