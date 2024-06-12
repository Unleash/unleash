import {
    Autocomplete,
    type AutocompleteProps,
    type AutocompleteRenderOptionState,
    Checkbox,
    TextField,
    styled,
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import type { IRole } from 'interfaces/role';
import { RoleDescription } from '../RoleDescription/RoleDescription';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';

const StyledRoleOption = styled('div')(({ theme }) => ({
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
        <li {...props}>
            <Checkbox
                icon={<CheckBoxOutlineBlankIcon fontSize='small' />}
                checkedIcon={<CheckBoxIcon fontSize='small' />}
                style={{ marginRight: 8 }}
                checked={state.selected}
            />
            <StyledRoleOption>
                <span>{option.name}</span>
                <span>{option.description}</span>
            </StyledRoleOption>
        </li>
    );

    return (
        <>
            <Autocomplete
                multiple
                disableCloseOnSelect
                openOnFocus
                size='small'
                value={value}
                onChange={(_, roles) => setValue(roles)}
                options={roles}
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
