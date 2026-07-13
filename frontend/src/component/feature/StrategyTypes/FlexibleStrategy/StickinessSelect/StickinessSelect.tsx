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
import { type ReactNode, useId } from 'react';
import {
    FormField,
    formFieldLabelId,
} from 'component/common/FormField/FormField';

interface IStickinessSelectProps {
    label: string;
    description?: ReactNode;
    value: string | undefined;
    onChange: (event: SelectChangeEvent<string>) => void;
    dataTestId?: string;
}

const StyledValueContainer = styled('div')(() => ({
    lineHeight: 1.1,
    marginTop: -2,
    marginBottom: -10,
}));

const StyledLabel = styled('div')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
}));

const StyledDescription = styled('p')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.neutral.main,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
}));

const StyledDropdownDescription = styled('p')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.neutral.main,
    overflow: 'hidden',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
}));

const StyledOptionContainer = styled('div')(() => ({
    lineHeight: 1.2,
    width: '100%',
}));

type StickinessSelectControlProps = {
    label?: ReactNode;
    id?: string;
    value: string | undefined;
    onChange: (event: SelectChangeEvent<string>) => void;
    dataTestId?: string;
};

const StickinessSelectControl = ({
    label,
    id: injectedId,
    value,
    onChange,
    dataTestId,
    ...props
}: StickinessSelectControlProps) => {
    const theme = useTheme();
    const generatedId = useId();
    const id = injectedId ?? generatedId;
    const labelId = formFieldLabelId(id);
    const stickinessOptions = useStickinessOptions(value);

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
            size='small'
            sx={{
                width: '100%',
                marginBottom: theme.spacing(2),
            }}
        >
            {/* TODO: remove floating-label branch when cleaning up 'topLabelInputs' flag */}
            {label ? (
                <InputLabel id={labelId} htmlFor={id}>
                    {label}
                </InputLabel>
            ) : null}
            <Select
                {...props}
                id={id}
                labelId={labelId}
                name='stickiness'
                label={label ?? undefined}
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

export const StickinessSelect = ({
    label,
    description,
    value,
    onChange,
    dataTestId,
}: IStickinessSelectProps) => (
    <FormField label={label} description={description}>
        <StickinessSelectControl
            value={value}
            onChange={onChange}
            dataTestId={dataTestId}
        />
    </FormField>
);
