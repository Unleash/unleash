import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import Input from 'component/common/Input/Input';
import useProjects from 'hooks/api/getters/useProjects/useProjects';

export interface SurveySettingsErrors {
    name?: string;
    submitUrl?: string;
}

interface SurveySettingsStepProps {
    projectId: string;
    name: string;
    submitUrl: string;
    errors: SurveySettingsErrors;
    onProjectIdChange: (projectId: string) => void;
    onNameChange: (name: string) => void;
    onSubmitUrlChange: (submitUrl: string) => void;
}

export const SurveySettingsStep = ({
    projectId,
    name,
    submitUrl,
    errors,
    onProjectIdChange,
    onNameChange,
    onSubmitUrlChange,
}: SurveySettingsStepProps) => {
    const { projects } = useProjects();

    return (
        <>
            <GeneralSelect
                label='Project'
                value={projectId}
                onChange={onProjectIdChange}
                options={projects.map((project) => ({
                    key: project.id,
                    label: project.name,
                }))}
                fullWidth
            />
            <Input
                label='Flag name'
                value={name}
                onChange={(event) => onNameChange(event.target.value.trim())}
                error={Boolean(errors.name)}
                errorText={errors.name}
            />
            <Input
                label='Submit URL'
                description='The Unleash instance that collects the responses. Defaults to this one.'
                value={submitUrl}
                onChange={(event) =>
                    onSubmitUrlChange(event.target.value.trim())
                }
                error={Boolean(errors.submitUrl)}
                errorText={errors.submitUrl}
                fullWidth
            />
        </>
    );
};
