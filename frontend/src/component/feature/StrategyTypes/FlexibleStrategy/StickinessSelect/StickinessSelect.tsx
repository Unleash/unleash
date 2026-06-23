import {
    MenuItem,
    styled,
    useTheme,
    Select,
    type SelectChangeEvent,
    FormControl,
    InputLabel,
} from '@mui/material';
import { useStickinessOptions } from 'hooks/useStickinessOptions';
import { SELECT_ITEM_ID } from 'utils/testIds';
import type { ReactNode } from 'react';
import { formFieldLabelId } from 'component/common/FormField/FormField';

interface IStickinessSelectProps {
    label: string;
    value: string | undefined;
    onChange: (event: SelectChangeEvent<string>) => void;
    dataTestId?: string;
    /** Set by a wrapping FormField so its label can name the combobox. */
    id?: string;
}

const StyledValueContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'baseline',
    gap: theme.spacing(1),
    overflow: 'hidden',
}));

const StyledLabel = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    flexShrink: 0,
}));

const StyledDescription = styled('p')(({ theme }) => ({
    margin: 0,
    minWidth: 0,
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.neutral.main,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
}));

const StyledDropdownDescription = styled('p')(({ theme }) => ({
    margin: 0,
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.neutral.main,
    overflow: 'hidden',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
}));

// Dropdown options keep the description stacked BELOW the value (unlike the
// collapsed value, which shows them side by side to fit the field height).
const StyledOptionContainer = styled('div')(({ theme }) => ({
    lineHeight: 1.2,
    width: '100%',
}));

export const StickinessSelect = ({
    label,
    value,
    onChange,
    dataTestId,
    id = 'stickiness-select',
}: IStickinessSelectProps) => {
    const theme = useTheme();
    const stickinessOptions = useStickinessOptions(value);
    const labelId = formFieldLabelId(id);

    const renderValue = (selected: string): ReactNode => {
        const option = stickinessOptions.find((o) => o.key === selected);
        return (
            <StyledValueContainer>
                <StyledLabel>{option?.label || selected}</StyledLabel>
                {option?.description && (
                    <StyledDescription>{option.description}</StyledDescription>
                )}
            </StyledValueContainer>
        );
    };

    return (
        <FormControl
            variant='outlined'
            size='large'
            sx={{
                width: '100%',
                marginBottom: theme.spacing(2),
            }}
        >
            {label ? (
                <InputLabel id={labelId} htmlFor={id}>
                    {label}
                </InputLabel>
            ) : null}
            <Select
                id={id}
                labelId={labelId}
                name='stickiness'
                label={label}
                value={value || ''}
                data-testid={dataTestId}
                onChange={onChange}
                renderValue={renderValue}
                MenuProps={{
                    anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left',
                    },
                    transformOrigin: {
                        vertical: 'top',
                        horizontal: 'left',
                    },
                    slotProps: {
                        paper: {
                            style: {
                                width: '18%',
                            },
                        },
                    },
                }}
            >
                {stickinessOptions.map((option) => (
                    <MenuItem
                        key={option.key}
                        value={option.key}
                        data-testid={`${SELECT_ITEM_ID}-${option.label}`}
                        sx={{
                            padding: theme.spacing(1, 2),
                        }}
                    >
                        <StyledOptionContainer>
                            <StyledLabel>{option.label}</StyledLabel>
                            {option.description && (
                                <StyledDropdownDescription>
                                    {option.description}
                                </StyledDropdownDescription>
                            )}
                        </StyledOptionContainer>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};
