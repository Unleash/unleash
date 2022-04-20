import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { IProjectCard } from 'interfaces/project';
import GeneralSelect, {
    ISelectOption,
    IGeneralSelectProps,
} from 'component/common/GeneralSelect/GeneralSelect';
import React from 'react';

interface IFeatureProjectSelectProps
    extends Omit<IGeneralSelectProps, 'options'> {
    enabled: boolean;
    value: string;
    filter: (project: string) => void;
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
        };
    };

    let options: ISelectOption[];

    if (filter) {
        options = projects
            .filter(project => filter(project.id))
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
