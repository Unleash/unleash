import useProjects from '../../../../../../hooks/api/getters/useProjects/useProjects';
import { IProject } from '../../../../../../interfaces/project';
import GeneralSelect from '../../../../../common/GeneralSelect/GeneralSelect';

interface IFeatureProjectSelect {
    enabled: boolean;
    value: string;
    onChange: (e: any) => void;
    filter: (project: string) => void;
}

const FeatureProjectSelect = ({
    enabled,
    value,
    onChange,
    filter,
    ...rest
}: IFeatureProjectSelect) => {
    const { projects } = useProjects();

    if (!enabled) {
        return null;
    }

    const formatOption = (project: IProject) => {
        return {
            key: project.id,
            label: project.name,
            title: project.description,
        };
    };

    let options;
    if (filter) {
        options = projects
            .filter(project => {
                return filter(project.id);
            })
            .map(formatOption);
    } else {
        options = projects.map(formatOption);
    }

    if (value && !options.find(o => o.key === value)) {
        options.push({ key: value, label: value });
    }

    return (
        <GeneralSelect
            label="Project"
            options={options}
            value={value}
            onChange={onChange}
            {...rest}
        />
    );
};

export default FeatureProjectSelect;
