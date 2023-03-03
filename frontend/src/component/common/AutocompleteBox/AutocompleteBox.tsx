import { useStyles } from 'component/common/AutocompleteBox/AutocompleteBox.styles';
import { Search, ArrowDropDown } from '@mui/icons-material';
import { Autocomplete, styled } from '@mui/material';
import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import { TextField } from '@mui/material';

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

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    borderRadius: theme.spacing(2),
    '& .MuiInputLabel-root[data-shrink="false"]': {
        top: 3,
    },
}));

const StyledIcon = styled('div', {
    shouldForwardProp: (prop: string) => !prop.startsWith('$'),
})<{ $disabled: boolean }>(({ theme, $disabled }) => ({
    background: $disabled
        ? theme.palette.primary.light
        : theme.palette.primary.main,
    height: '48px',
    width: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 6,
    borderTopLeftRadius: '40px',
    borderBottomLeftRadius: '40px',
    color: theme.palette.primary.contrastText,
}));

const StyledAutocomplete = styled(Autocomplete)({
    flex: 1,
}) as typeof Autocomplete;

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
        <StyledContainer>
            <StyledIcon $disabled={Boolean(disabled)} aria-hidden>
                <Search />
            </StyledIcon>
            <StyledAutocomplete
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
        </StyledContainer>
    );
};
