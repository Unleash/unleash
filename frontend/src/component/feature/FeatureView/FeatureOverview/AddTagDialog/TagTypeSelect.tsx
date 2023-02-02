import React from 'react';
import useTagTypes from 'hooks/api/getters/useTagTypes/useTagTypes';
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
    value: ITagType;
    onChange: AutocompleteProps<ITagType, false, any, any>['onChange'];
    autoFocus?: boolean;
}

const ListItem = styled('li')({
    flexDirection: 'column',
});
const TagTypeSelect = ({ value, onChange }: ITagSelect) => {
    const { tagTypes } = useTagTypes();
    const theme = useTheme();

    return (
        <>
            <Autocomplete
                disablePortal
                id="tag-type-select"
                options={tagTypes}
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
                sx={{ width: 500 }}
                ListboxProps={{ style: { maxHeight: 200, overflow: 'auto' } }}
            />
        </>
    );
};

export default TagTypeSelect;
