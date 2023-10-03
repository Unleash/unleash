import {
    Autocomplete,
    AutocompleteRenderGroupParams,
    Checkbox,
    styled,
    TextField,
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { caseInsensitiveSearch } from 'utils/search';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { Fragment } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { SelectAllButton } from 'component/admin/apiToken/ApiTokenForm/ProjectSelector/SelectProjectInput/SelectAllButton/SelectAllButton';

const StyledOption = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    color: theme.palette.text.secondary,
    '& > span:first-of-type': {
        color: theme.palette.text.primary,
    },
}));

const StyledTags = styled('div')(({ theme }) => ({
    paddingLeft: theme.spacing(1),
}));

const StyledGroupFormUsersSelect = styled('div')(({ theme }) => ({
    display: 'flex',
    marginBottom: theme.spacing(3),
    '& > div:first-of-type': {
        width: '100%',
        maxWidth: theme.spacing(50),
        marginRight: theme.spacing(1),
    },
}));

const renderOption = (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: IProjectBase,
    selected: boolean
) => (
    <li {...props}>
        <Checkbox
            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
            checkedIcon={<CheckBoxIcon fontSize="small" />}
            style={{ marginRight: 8 }}
            checked={selected}
        />
        <StyledOption>
            <span>{option.name}</span>
            <span>{option.description}</span>
        </StyledOption>
    </li>
);

const renderTags = (value: IProjectBase[]) => (
    <StyledTags>
        {value.length > 1 ? `${value.length} projects selected` : value[0].name}
    </StyledTags>
);

interface IProjectBase {
    id: string;
    name: string;
    description: string;
}

interface IEnvironmentProjectSelectProps {
    projects: string[];
    setProjects: React.Dispatch<React.SetStateAction<string[]>>;
}

export const EnvironmentProjectSelect = ({
    projects,
    setProjects,
}: IEnvironmentProjectSelectProps) => {
    const { projects: projectsAll } = useProjects();

    const projectOptions = projectsAll
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(({ id, name, description }) => ({
            id,
            name,
            description,
        })) as IProjectBase[];

    const selectedProjects = projectOptions.filter(({ id }) =>
        projects.includes(id)
    );

    const isAllSelected =
        projects.length > 0 && projects.length === projectOptions.length;

    const onSelectAllClick = () => {
        const newProjects = isAllSelected
            ? []
            : projectOptions.map(({ id }) => id);
        setProjects(newProjects);
    };

    const renderGroup = ({ key, children }: AutocompleteRenderGroupParams) => (
        <Fragment key={key}>
            <ConditionallyRender
                condition={projectOptions.length > 2}
                show={
                    <SelectAllButton
                        isAllSelected={isAllSelected}
                        onClick={onSelectAllClick}
                    />
                }
            />
            {children}
        </Fragment>
    );

    return (
        <StyledGroupFormUsersSelect>
            <Autocomplete
                size="small"
                multiple
                limitTags={1}
                openOnFocus
                disableCloseOnSelect
                value={selectedProjects}
                onChange={(event, newValue, reason) => {
                    if (
                        event.type === 'keydown' &&
                        (event as React.KeyboardEvent).key === 'Backspace' &&
                        reason === 'removeOption'
                    ) {
                        return;
                    }
                    setProjects(newValue.map(({ id }) => id));
                }}
                options={projectOptions}
                renderOption={(props, option, { selected }) =>
                    renderOption(props, option, selected)
                }
                filterOptions={(options, { inputValue }) =>
                    options.filter(
                        ({ name, description }) =>
                            caseInsensitiveSearch(inputValue, name) ||
                            caseInsensitiveSearch(inputValue, description)
                    )
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={option =>
                    option.name || option.description || ''
                }
                renderInput={params => (
                    <TextField {...params} label="Projects" />
                )}
                renderTags={value => renderTags(value)}
                groupBy={() => 'Select/Deselect all'}
                renderGroup={renderGroup}
            />
        </StyledGroupFormUsersSelect>
    );
};
