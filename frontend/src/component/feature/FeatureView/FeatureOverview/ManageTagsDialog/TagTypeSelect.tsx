import {
    Autocomplete,
    AutocompleteProps,
    styled,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import { ITagType } from 'interfaces/tags';

interface ITagSelect {
    options: ITagType[];
    value: ITagType;
    disabled?: boolean;
    onChange: AutocompleteProps<ITagType, false, any, any>['onChange'];
}

const ListItem = styled('li')({
    flexDirection: 'column',
});

export const TagTypeSelect = ({
    options,
    value,
    disabled = false,
    onChange,
}: ITagSelect) => {
    const theme = useTheme();

    return (
        <Autocomplete
            disablePortal
            disabled={disabled}
            id="tag-type-select"
            sx={{ marginTop: theme => theme.spacing(2), width: 500 }}
            options={options}
            disableClearable
            value={value}
            getOptionLabel={option => option.name}
            renderOption={(props, option) => (
                <ListItem
                    {...props}
                    style={{
                        alignItems: 'flex-start',
                        gap: theme.spacing(0.5),
                    }}
                >
                    <Typography variant="body1">{option.name}</Typography>
                    <Typography variant="caption">
                        {option.description}
                    </Typography>
                </ListItem>
            )}
            renderInput={params => (
                <TextField {...params} label="Tag type" value={value} />
            )}
            onChange={onChange}
            ListboxProps={{ style: { maxHeight: 200, overflow: 'auto' } }}
        />
    );
};
