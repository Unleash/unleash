import {
    Autocomplete,
    type AutocompleteProps,
    type AutocompleteRenderOptionState,
    Checkbox,
    styled,
    TextField,
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import type { IRole } from 'interfaces/role';
import { RoleDescription } from '../RoleDescription/RoleDescription.tsx';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender.tsx';

const StyledRoleOption = styled('div')(({ theme }) => ({
    paddingTop: theme.spacing(0.75),
    display: 'flex',
    flexDirection: 'column',
    '& > span:last-of-type': {
        fontSize: theme.fontSizes.smallerBody,
        color: theme.palette.text.secondary,
    },
}));

interface IMultipleRoleSelectProps
    extends Partial<AutocompleteProps<IRole, true, false, false>> {
    roles: IRole[];
    value: IRole[];
    setValue: (role: IRole[]) => void;
    required?: boolean;
}

function sortItems<T extends { name: string; type: string }>(items: T[]): T[] {
    return items.sort((a, b) => {
        if (a.type !== b.type) {
            return a.type === 'project' ? -1 : 1;
        }

        if (a.type === 'custom') {
            return a.name.localeCompare(b.name);
        }

        return 0;
    });
}

const StyledListItem = styled('li')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(0.5),
}));

export const MultipleRoleSelect = ({
    roles,
    value,
    setValue,
    required,
    ...rest
}: IMultipleRoleSelectProps) => {
    const renderRoleOption = (
        props: React.HTMLAttributes<HTMLLIElement>,
        option: IRole,
        state: AutocompleteRenderOptionState,
    ) => (
        <StyledListItem {...props} key={option.id}>
            <Checkbox
                icon={<CheckBoxOutlineBlankIcon fontSize='small' />}
                checkedIcon={<CheckBoxIcon fontSize='small' />}
                checked={state.selected}
            />
            <StyledRoleOption>
                <span>{option.name}</span>
                <span>{option.description}</span>
            </StyledRoleOption>
        </StyledListItem>
    );

    const sortedRoles = sortItems(roles);

    return (
        <>
            <Autocomplete
                slotProps={{
                    paper: {
                        sx: {
                            '& .MuiAutocomplete-listbox': {
                                '& .MuiAutocomplete-option': {
                                    paddingLeft: (theme) => theme.spacing(0.5),
                                    alignItems: 'flex-start',
                                },
                            },
                        },
                    },
                }}
                multiple
                disableCloseOnSelect
                openOnFocus
                size='small'
                value={value}
                groupBy={(option) => {
                    return option.type === 'project'
                        ? 'Predefined project roles'
                        : 'Custom project roles';
                }}
                onChange={(_, roles) => setValue(roles)}
                options={sortedRoles}
                renderOption={renderRoleOption}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                    <TextField {...params} label='Role' required={required} />
                )}
                {...rest}
            />
            <ConditionallyRender
                condition={value.length > 0}
                show={() => (
                    <>
                        {value.map(({ id }) => (
                            <RoleDescription
                                key={id}
                                sx={{ marginTop: 1 }}
                                roleId={id}
                            />
                        ))}
                    </>
                )}
            />
        </>
    );
};
