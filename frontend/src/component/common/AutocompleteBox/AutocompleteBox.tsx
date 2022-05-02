import { useStyles } from 'component/common/AutocompleteBox/AutocompleteBox.styles';
import { Search, ArrowDropDown } from '@mui/icons-material';
import { Autocomplete } from '@mui/material';
import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import { TextField } from '@mui/material';
import classNames from 'classnames';

interface IAutocompleteBoxProps {
    label: string;
    options: IAutocompleteBoxOption[];
    value?: IAutocompleteBoxOption[];
    onChange: (value: IAutocompleteBoxOption[]) => void;
    disabled?: boolean;
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
    disabled,
}: IAutocompleteBoxProps) => {
    const { classes: styles } = useStyles();

    const renderInput = (params: AutocompleteRenderInputParams) => {
        return <TextField {...params} variant="outlined" label={label} />;
    };

    return (
        <div className={styles.container}>
            <div
                className={classNames(
                    styles.icon,
                    disabled && styles.iconDisabled
                )}
                aria-hidden
            >
                <Search />
            </div>
            <Autocomplete
                className={styles.autocomplete}
                classes={{ inputRoot: styles.inputRoot }}
                options={options}
                value={value}
                popupIcon={<ArrowDropDown titleAccess="Toggle" />}
                onChange={(event, value) => onChange(value || [])}
                renderInput={renderInput}
                getOptionLabel={value => value.label}
                disabled={disabled}
                size="small"
                multiple
            />
        </div>
    );
};
