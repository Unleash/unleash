import useProjects from 'hooks/api/getters/useProjects/useProjects';
import type { IProjectCard } from 'interfaces/project';
import GeneralSelect, {
    type ISelectOption,
    type IGeneralSelectProps,
} from 'component/common/GeneralSelect/GeneralSelect';

interface IFeatureProjectSelectProps
    extends Omit<IGeneralSelectProps, 'options'> {
    enabled: boolean;
    value: string;
    filter: (projectId: string) => boolean;
}

const FeatureProjectSelect = ({
    enabled,
    value,
    onChange,
    filter,
    ...rest
}: IFeatureProjectSelectProps) => {
    const { projects } = useProjects();

    if (!enabled) {
        return null;
    }

    const formatOption = (project: IProjectCard) => {
        return {
            key: project.id,
            label: project.name,
            title: project.description,
            sx: {
                whiteSpace: 'pre-line',
            },
        };
    };

    let options: ISelectOption[];

    if (filter) {
        options = projects
            .filter((project) => filter(project.id))
            .map(formatOption);
    } else {
        options = projects.map(formatOption);
    }

    if (value && !options.find((o) => o.key === value)) {
        options.push({ key: value, label: value });
    }

    return (
        <GeneralSelect
            label='Project'
            options={options}
            value={value}
            onChange={onChange}
            {...rest}
        />
    );
};

export default FeatureProjectSelect;
