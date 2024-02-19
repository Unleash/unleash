import { ComponentProps, Dispatch, SetStateAction, VFC } from 'react';
import { Autocomplete, Box, styled, TextField } from '@mui/material';
import { renderOption } from '../../playground/Playground/PlaygroundForm/renderOption';
import useProjects from '../../../hooks/api/getters/useProjects/useProjects';

const StyledBox = styled(Box)(({ theme }) => ({
    width: '25%',
    marginLeft: '75%',
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(4),
    [theme.breakpoints.down('lg')]: {
        width: '100%',
        marginLeft: 0,
    },
}));

interface IOption {
    label: string;
    id: string;
}

export const allOption = { label: 'ALL', id: '*' };

interface IProjectSelectProps {
    selectedProjects: string[];
    onChange: Dispatch<SetStateAction<string[]>>;
}

export const ProjectSelect: VFC<IProjectSelectProps> = ({
    selectedProjects,
    onChange,
}) => {
    const { projects: availableProjects } = useProjects();

    const projectsOptions = [
        allOption,
        ...availableProjects.map(({ name: label, id }) => ({
            label,
            id,
        })),
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
        <StyledBox>
            <Autocomplete
                disablePortal
                id='projects'
                limitTags={3}
                multiple={!isAllProjects}
                options={projectsOptions}
                sx={{ flex: 1 }}
                renderInput={(params) => (
                    <TextField {...params} label='Projects' />
                )}
                renderOption={renderOption}
                getOptionLabel={({ label }) => label}
                disableCloseOnSelect
                size='small'
                value={
                    isAllProjects
                        ? allOption
                        : projectsOptions.filter(({ id }) =>
                              selectedProjects.includes(id),
                          )
                }
                onChange={onProjectsChange}
                data-testid={'DASHBOARD_PROJECT_SELECT'}
            />
        </StyledBox>
    );
};
