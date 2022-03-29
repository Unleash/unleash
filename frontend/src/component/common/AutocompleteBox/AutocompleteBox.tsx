import { useStyles } from 'component/common/AutocompleteBox/AutocompleteBox.styles';
import { Search, ArrowDropDown } from '@material-ui/icons';
import { Autocomplete, AutocompleteRenderInputParams } from '@material-ui/lab';
import { TextField } from '@material-ui/core';

interface IAutocompleteBoxProps {
    label: string;
    options: IAutocompleteBoxOption[];
    value?: IAutocompleteBoxOption[];
    onChange: (value: IAutocompleteBoxOption[]) => void;
}

export interface IAutocompleteBoxOption {
    value: string;
    label: string;
}

export const AutocompleteBox = ({
    label,
    options,
    value = [],
    onChange,
}: IAutocompleteBoxProps) => {
    const styles = useStyles();

    const renderInput = (params: AutocompleteRenderInputParams) => {
        return <TextField {...params} variant="outlined" label={label} />;
    };

    return (
        <div className={styles.container}>
            <div className={styles.icon} aria-hidden>
                <Search />
            </div>
            <Autocomplete
                className={styles.autocomplete}
                classes={{ inputRoot: styles.inputRoot }}
                options={options}
                value={value}
                popupIcon={<ArrowDropDown />}
                onChange={(event, value) => onChange(value || [])}
                renderInput={renderInput}
                getOptionLabel={value => value.label}
                multiple
            />
        </div>
    );
};
