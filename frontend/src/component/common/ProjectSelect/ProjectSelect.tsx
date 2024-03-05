import { ComponentProps, Dispatch, SetStateAction, VFC } from 'react';
import { Autocomplete, SxProps, TextField } from '@mui/material';
import { renderOption } from 'component/playground/Playground/PlaygroundForm/renderOption';
import useProjects from 'hooks/api/getters/useProjects/useProjects';

interface IOption {
    label: string;
    id: string;
}

export const allOption = { label: 'ALL', id: '*' };

interface IProjectSelectProps {
    selectedProjects: string[];
    onChange:
        | Dispatch<SetStateAction<string[]>>
        | ((projects: string[]) => void);
    dataTestId?: string;
    sx?: SxProps;
    disabled?: boolean;
}

function findAllIndexes(arr: string[], name: string): number[] {
    const indexes: number[] = [];
    arr.forEach((currentValue, index) => {
        if (currentValue === name) {
            indexes.push(index);
        }
    });
    return indexes;
}

export const ProjectSelect: VFC<IProjectSelectProps> = ({
    selectedProjects,
    onChange,
    dataTestId,
    sx,
    disabled,
}) => {
    const { projects: availableProjects } = useProjects();

    const projectNames = availableProjects.map(({ name }) => name);

    const projectsOptions = [
        allOption,
        ...availableProjects.map(({ name, id }) => {
            const indexes = findAllIndexes(projectNames, name);
            const isDuplicate = indexes.length > 1;

            return {
                label: isDuplicate ? `${name} - (${id})` : name,
                id,
            };
        }),
    ];

    const isAllProjects =
        selectedProjects &&
        (selectedProjects.length === 0 ||
            (selectedProjects.length === 1 && selectedProjects[0] === '*'));

    const onProjectsChange: ComponentProps<typeof Autocomplete>['onChange'] = (
        event,
        value,
        reason,
    ) => {
        const newProjects = value as IOption | IOption[];
        if (reason === 'clear' || newProjects === null) {
            return onChange([allOption.id]);
        }
        if (Array.isArray(newProjects)) {
            if (newProjects.length === 0) {
                return onChange([allOption.id]);
            }
            if (
                newProjects.find(({ id }) => id === allOption.id) !== undefined
            ) {
                return onChange([allOption.id]);
            }
            return onChange(newProjects.map(({ id }) => id));
        }
        if (newProjects.id === allOption.id) {
            return onChange([allOption.id]);
        }

        return onChange([newProjects.id]);
    };

    return (
        <Autocomplete
            disablePortal
            id='projects'
            limitTags={3}
            multiple={!isAllProjects}
            options={projectsOptions}
            sx={sx}
            renderInput={(params) => <TextField {...params} label='Projects' />}
            renderOption={renderOption}
            getOptionLabel={({ label }) => label}
            disableCloseOnSelect
            size='small'
            disabled={disabled}
            value={
                isAllProjects
                    ? allOption
                    : projectsOptions.filter(({ id }) =>
                          selectedProjects.includes(id),
                      )
            }
            onChange={onProjectsChange}
            data-testid={dataTestId ? dataTestId : 'PROJECT_SELECT'}
        />
    );
};
