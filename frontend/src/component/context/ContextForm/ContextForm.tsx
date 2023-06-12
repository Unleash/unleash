import Input from 'component/common/Input/Input';
import {
    TextField,
    Button,
    Switch,
    Typography,
    styled,
    Theme,
    Link,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { Add } from '@mui/icons-material';
import { ILegalValue } from 'interfaces/context';
import { ContextFormChip } from 'component/context/ContectFormChip/ContextFormChip';
import { ContextFormChipList } from 'component/context/ContectFormChip/ContextFormChipList';
import { ContextFieldUsage } from '../ContextFieldUsage/ContextFieldUsage';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

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
}

const ENTER = 'Enter';

const StyledForm = styled('form')({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
});

const StyledContainer = styled('div')({
    maxWidth: '470px',
});

const StyledInputDescription = styled('p')(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

const styledInput = (theme: Theme) => ({
    width: '100%',
    marginBottom: theme.spacing(2),
});

const StyledTagContainer = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
}));

const StyledInputHeader = styled('p')(({ theme }) => ({
    marginBottom: theme.spacing(0.5),
}));

const StyledSwitchContainer = styled('div')({
    display: 'flex',
    alignItems: 'center',
    marginLeft: '-9px',
});

const StyledButtonContainer = styled('div')({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
});

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
    const { uiConfig } = useUiConfig();

    const isMissingValue = valueDesc.trim() && !value.trim();

    const isDuplicateValue = legalValues.some(legalValue => {
        return legalValue.value.trim() === value.trim();
    });

    useEffect(() => {
        setErrors(prev => ({
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
            setLegalValues(prev => [...prev, next].sort(sortLegalValues));
        }
    };

    const removeLegalValue = (value: ILegalValue) => {
        setLegalValues(prev => prev.filter(p => p.value !== value.value));
    };

    return (
        <StyledForm onSubmit={onSubmit}>
            <StyledContainer>
                <StyledInputDescription>
                    What is your context name?
                </StyledInputDescription>
                <Input
                    sx={styledInput}
                    label="Context name"
                    value={contextName}
                    disabled={mode === 'Edit'}
                    onChange={e => setContextName(e.target.value.trim())}
                    error={Boolean(errors.name)}
                    errorText={errors.name}
                    onFocus={() => clearErrors('name')}
                    onBlur={validateContext}
                    autoFocus
                />
                <StyledInputDescription>
                    What is this context for?
                </StyledInputDescription>
                <TextField
                    sx={styledInput}
                    label="Context description (optional)"
                    variant="outlined"
                    multiline
                    maxRows={4}
                    value={contextDesc}
                    size="small"
                    onChange={e => setContextDesc(e.target.value)}
                />
                <StyledInputDescription>
                    Which values do you want to allow?
                </StyledInputDescription>
                <StyledTagContainer>
                    <TextField
                        label="Legal value (optional)"
                        name="value"
                        sx={{ gridColumn: 1 }}
                        value={value}
                        error={Boolean(errors.tag)}
                        helperText={errors.tag}
                        variant="outlined"
                        size="small"
                        onChange={e => setValue(e.target.value)}
                        onKeyPress={e => onKeyDown(e)}
                        onBlur={() => setValueFocused(false)}
                        onFocus={() => setValueFocused(true)}
                        inputProps={{ maxLength: 100 }}
                    />
                    <TextField
                        label="Value description (optional)"
                        sx={{ gridColumn: 1 }}
                        value={valueDesc}
                        variant="outlined"
                        size="small"
                        onChange={e => setValueDesc(e.target.value)}
                        onKeyPress={e => onKeyDown(e)}
                        onBlur={() => setValueFocused(false)}
                        onFocus={() => setValueFocused(true)}
                        inputProps={{ maxLength: 100 }}
                    />
                    <Button
                        sx={{ gridColumn: 2 }}
                        startIcon={<Add />}
                        onClick={addLegalValue}
                        variant="outlined"
                        color="primary"
                        disabled={!value.trim() || isDuplicateValue}
                    >
                        Add
                    </Button>
                </StyledTagContainer>
                <ContextFormChipList>
                    {legalValues.map(legalValue => {
                        return (
                            <ContextFormChip
                                key={legalValue.value}
                                label={legalValue.value}
                                description={legalValue.description}
                                onRemove={() => removeLegalValue(legalValue)}
                            />
                        );
                    })}
                </ContextFormChipList>
                <StyledInputHeader>Custom stickiness</StyledInputHeader>
                <p>
                    By enabling stickiness on this context field you can use it
                    together with the flexible-rollout strategy. This will
                    guarantee a consistent behavior for specific values of this
                    context field. PS! Not all client SDK's support this feature
                    yet!{' '}
                    <Link
                        href="https://docs.getunleash.io/reference/stickiness"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Read more
                    </Link>
                </p>
                <StyledSwitchContainer>
                    <Switch
                        checked={stickiness}
                        value={stickiness}
                        onChange={() => setStickiness(!stickiness)}
                    />
                    <Typography>{stickiness ? 'On' : 'Off'}</Typography>
                </StyledSwitchContainer>
                <ConditionallyRender
                    condition={Boolean(uiConfig.flags.segmentContextFieldUsage)}
                    show={<ContextFieldUsage contextName={contextName} />}
                />
            </StyledContainer>
            <StyledButtonContainer>
                {children}
                <StyledCancelButton onClick={onCancel}>
                    Cancel
                </StyledCancelButton>
            </StyledButtonContainer>
        </StyledForm>
    );
};
