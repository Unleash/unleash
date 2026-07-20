import Input from 'component/common/Input/Input';
import {
    FormField,
    FormFieldControlAligner,
} from 'component/common/FormField/FormField';
import { FormGroup } from 'component/common/FormGroup/FormGroup';
import {
    Button,
    Switch,
    Typography,
    styled,
    type Theme,
    Link,
} from '@mui/material';
import type React from 'react';
import { useState, useEffect } from 'react';
import Add from '@mui/icons-material/Add';
import type { ILegalValue } from 'interfaces/context';
import { ContextFormChip } from 'component/context/ContectFormChip/ContextFormChip';
import { ContextFormChipList } from 'component/context/ContectFormChip/ContextFormChipList';
import { ContextFieldUsage } from '../ContextFieldUsage/ContextFieldUsage.tsx';

interface IContextForm {
    contextName: string;
    contextDesc: string;
    legalValues: ILegalValue[];
    stickiness: boolean;
    setContextName: React.Dispatch<React.SetStateAction<string>>;
    setContextDesc: React.Dispatch<React.SetStateAction<string>>;
    setStickiness: React.Dispatch<React.SetStateAction<boolean>>;
    setLegalValues: React.Dispatch<React.SetStateAction<ILegalValue[]>>;
    handleSubmit: (e: any) => void;
    onCancel: () => void;
    errors: { [key: string]: string };
    mode: 'Create' | 'Edit';
    clearErrors: (key?: string) => void;
    validateContext?: () => void;
    setErrors: React.Dispatch<React.SetStateAction<Object>>;
    children?: React.ReactNode;
}

const ENTER = 'Enter';

const StyledForm = styled('form')({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
});

const styledInput = (theme: Theme) => ({
    width: '100%',
    marginBottom: theme.spacing(2),
});

const StyledValueRow = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '1fr 2fr auto',
    gap: theme.spacing(1),
    alignItems: 'start',
    paddingBottom: theme.spacing(1),
    '&& > *': {
        marginBottom: 0,
    },
}));

const StyledInputHeader = styled('p')(({ theme }) => ({
    marginBottom: theme.spacing(0.5),
    marginTop: theme.spacing(2),
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
}));

const StyledHelpText = styled('p')(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const StyledSwitchContainer = styled('div')({
    display: 'flex',
    alignItems: 'center',
    marginLeft: '-9px',
});

const StyledButtonContainer = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(3),
    display: 'flex',
    justifyContent: 'flex-end',
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

export const ContextForm: React.FC<IContextForm> = ({
    children,
    handleSubmit,
    onCancel,
    contextName,
    contextDesc,
    legalValues,
    stickiness,
    setContextName,
    setContextDesc,
    setLegalValues,
    setStickiness,
    errors,
    mode,
    validateContext,
    setErrors,
    clearErrors,
}) => {
    const [value, setValue] = useState('');
    const [valueDesc, setValueDesc] = useState('');
    const [valueFocused, setValueFocused] = useState(false);

    const isMissingValue = valueDesc.trim() && !value.trim();

    const isDuplicateValue = legalValues.some((legalValue) => {
        return legalValue.value.trim() === value.trim();
    });

    useEffect(() => {
        setErrors((prev) => ({
            ...prev,
            tag: isMissingValue
                ? 'Value cannot be empty'
                : isDuplicateValue
                  ? 'Duplicate value'
                  : undefined,
        }));
    }, [setErrors, isMissingValue, isDuplicateValue]);

    const onSubmit = (event: React.SyntheticEvent) => {
        event.preventDefault();
        handleSubmit(event);
    };

    const onKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === ENTER) {
            event.preventDefault();
            if (valueFocused) {
                addLegalValue();
            } else {
                handleSubmit(event);
            }
        }
    };

    const sortLegalValues = (a: ILegalValue, b: ILegalValue) => {
        return a.value.toLowerCase().localeCompare(b.value.toLowerCase());
    };

    const addLegalValue = () => {
        const next: ILegalValue = {
            value: value.trim(),
            description: valueDesc.trim(),
        };
        if (next.value && !isDuplicateValue) {
            setValue('');
            setValueDesc('');
            setLegalValues((prev) => [...prev, next].sort(sortLegalValues));
        }
    };

    const removeLegalValue = (value: ILegalValue) => {
        setLegalValues((prev) => prev.filter((p) => p.value !== value.value));
    };

    return (
        <StyledForm onSubmit={onSubmit}>
            <div>
                <Input
                    sx={styledInput}
                    label='Context name'
                    value={contextName}
                    disabled={mode === 'Edit'}
                    onChange={(e) => setContextName(e.target.value.trim())}
                    error={Boolean(errors.name)}
                    errorText={errors.name}
                    onFocus={() => clearErrors('name')}
                    onBlur={validateContext}
                    autoFocus
                />
                <Input
                    sx={styledInput}
                    label='Context description (optional)'
                    multiline
                    minRows={3}
                    maxRows={4}
                    value={contextDesc}
                    size='small'
                    onChange={(e) => setContextDesc(e.target.value)}
                />
                <FormField
                    label='Legal values (optional)'
                    description='Which values do you want to allow?'
                >
                    <FormGroup>
                        <StyledValueRow>
                            <Input
                                fullWidth
                                label='Legal value'
                                name='value'
                                value={value}
                                error={Boolean(errors.tag)}
                                errorText={errors.tag}
                                onChange={(e) => setValue(e.target.value)}
                                onKeyPress={(e) => onKeyDown(e)}
                                onBlur={() => setValueFocused(false)}
                                onFocus={() => setValueFocused(true)}
                                slotProps={{
                                    htmlInput: { maxLength: 100 },
                                }}
                            />
                            <Input
                                fullWidth
                                label='Value description'
                                value={valueDesc}
                                onChange={(e) => setValueDesc(e.target.value)}
                                onKeyPress={(e) => onKeyDown(e)}
                                onBlur={() => setValueFocused(false)}
                                onFocus={() => setValueFocused(true)}
                                slotProps={{
                                    htmlInput: { maxLength: 100 },
                                }}
                            />
                            <FormFieldControlAligner>
                                <Button
                                    startIcon={<Add />}
                                    onClick={addLegalValue}
                                    variant='outlined'
                                    color='primary'
                                    disabled={!value.trim() || isDuplicateValue}
                                >
                                    Add
                                </Button>
                            </FormFieldControlAligner>
                        </StyledValueRow>
                        {legalValues.length > 0 ? (
                            <ContextFormChipList>
                                {legalValues.map((legalValue) => (
                                    <ContextFormChip
                                        key={legalValue.value}
                                        label={legalValue.value}
                                        description={legalValue.description}
                                        onRemove={() =>
                                            removeLegalValue(legalValue)
                                        }
                                    />
                                ))}
                            </ContextFormChipList>
                        ) : null}
                    </FormGroup>
                </FormField>
                <StyledInputHeader>Custom stickiness</StyledInputHeader>
                <StyledHelpText>
                    By enabling stickiness on this context field you can use it
                    together with the flexible-rollout strategy. This will
                    guarantee a consistent behavior for specific values of this
                    context field. PS! Not all client SDK's support this feature
                    yet!{' '}
                    <Link
                        href='https://docs.getunleash.io/concepts/stickiness'
                        target='_blank'
                        rel='noreferrer'
                    >
                        Read more
                    </Link>
                </StyledHelpText>
                <StyledSwitchContainer>
                    <Switch
                        checked={stickiness}
                        value={stickiness}
                        onChange={() => setStickiness(!stickiness)}
                    />
                    <Typography>{stickiness ? 'On' : 'Off'}</Typography>
                </StyledSwitchContainer>
                {mode === 'Edit' ? (
                    <ContextFieldUsage contextName={contextName} />
                ) : null}
            </div>
            <StyledButtonContainer>
                {children}
                <StyledCancelButton onClick={onCancel}>
                    Cancel
                </StyledCancelButton>
            </StyledButtonContainer>
        </StyledForm>
    );
};
