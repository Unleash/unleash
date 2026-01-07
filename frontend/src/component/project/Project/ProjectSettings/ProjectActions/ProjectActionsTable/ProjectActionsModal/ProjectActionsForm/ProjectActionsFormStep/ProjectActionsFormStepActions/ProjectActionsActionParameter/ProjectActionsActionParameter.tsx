import type { ActionConfigurationParameter } from 'interfaces/action';
import { ProjectActionsActionParameterAutocomplete } from './ProjectActionsActionParameterAutocomplete.tsx';

interface IProjectActionsActionParameterProps {
    parameter: ActionConfigurationParameter;
    value: string;
    onChange: (value: string) => void;
}

export const ProjectActionsActionParameter = ({
    parameter,
    value,
    onChange,
}: IProjectActionsActionParameterProps) => {
    const { label, type } = parameter;

    if (type === 'select') {
        const { options } = parameter;

        return (
            <ProjectActionsActionParameterAutocomplete
                label={label}
                value={value}
                onChange={onChange}
                options={options}
            />
        );
    }

    return null;
};
