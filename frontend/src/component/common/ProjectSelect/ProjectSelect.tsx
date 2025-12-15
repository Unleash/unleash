import {
    forwardRef,
    type ComponentProps,
    type Dispatch,
    type SetStateAction,
    type VFC,
} from 'react';
import { Autocomplete, Chip, type SxProps, TextField } from '@mui/material';
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
    limitTags: number;
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

export const ProjectSelect: VFC<IProjectSelectProps> = forwardRef(
    (
        {
            limitTags,
            selectedProjects,
            onChange,
            dataTestId,
            sx,
            disabled,
            ...props
        },
        ref,
    ) => {
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

        const onProjectsChange: ComponentProps<
            typeof Autocomplete
        >['onChange'] = (_event, value, reason) => {
            const newProjects = value as IOption | IOption[];
            if (reason === 'clear' || newProjects === null) {
                return onChange([allOption.id]);
            }
            if (Array.isArray(newProjects)) {
                if (newProjects.length === 0) {
                    return onChange([allOption.id]);
                }
                if (
                    newProjects.find(({ id }) => id === allOption.id) !==
                    undefined
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
                {...props}
                ref={ref}
                disablePortal
                id='projects'
                limitTags={limitTags}
                multiple={!isAllProjects}
                options={projectsOptions}
                sx={sx}
                renderInput={(params) => (
                    <TextField {...params} label='Projects' />
                )}
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
                renderTags={(value, getTagProps) => {
                    const numTags = value.length;

                    return (
                        <>
                            {value.slice(0, limitTags).map((option, index) => (
                                <Chip
                                    {...getTagProps({ index })}
                                    size='small'
                                    key={index}
                                    label={option.label}
                                />
                            ))}

                            {numTags > limitTags && ` +${numTags - limitTags}`}
                        </>
                    );
                }}
            />
        );
    },
);
