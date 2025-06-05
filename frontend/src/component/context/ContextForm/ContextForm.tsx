import Input from 'component/common/Input/Input';
import {
    TextField,
    Button,
    Switch,
    Typography,
    styled,
    type Theme,
    Link,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import type React from 'react';
import { useState, useEffect } from 'react';
import Add from '@mui/icons-material/Add';
import type { ILegalValue } from 'interfaces/context';
import { ContextFormChipList } from 'component/context/ContectFormChip/ContextFormChipList';
import { ContextFieldUsage } from '../ContextFieldUsage/ContextFieldUsage.tsx';
import type { ContextFieldType } from 'constants/operators.ts';
import { useFlag } from '@unleash/proxy-client-react';

interface IContextForm {
    contextName: string;
    contextDesc: string;
    legalValues: ILegalValue[];
    stickiness: boolean;
    valueType?: ContextFieldType;
    setContextName: React.Dispatch<React.SetStateAction<string>>;
    setContextDesc: React.Dispatch<React.SetStateAction<string>>;
    setStickiness: React.Dispatch<React.SetStateAction<boolean>>;
    setLegalValues: React.Dispatch<React.SetStateAction<ILegalValue[]>>;
    setValueType: React.Dispatch<
        React.SetStateAction<ContextFieldType | undefined>
    >;
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

const StyledInputDescription = styled('p')(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

const styledInput = (theme: Theme) => ({
    width: '100%',
    marginBottom: theme.spacing(2),
});

const StyledLegalValueContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginBottom: theme.spacing(2),
}));

const StyledLegalValueHeader = styled('div')({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
});

const StyledLegalValueInputContainer = styled('div')({
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '1rem',
});

const StyledTagContainer = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(1),
}));

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
    contextName,
    contextDesc,
    legalValues,
    stickiness,
    valueType,
    setContextName,
    setContextDesc,
    setLegalValues,
    setStickiness,
    setValueType,
    handleSubmit,
    onCancel,
    errors,
    mode,
    validateContext,
    setErrors,
    clearErrors,
}) => {
    const [value, setValue] = useState('');
    const [description, setDescription] = useState('');

    const useValueType = useFlag('contextFieldValueType') || true;

    useEffect(() => {
        if (legalValues.length > 0 && value.length > 0) {
            clearErrors('legalValues');
        }
    }, [legalValues, value]);

    const onAddLegalValue = () => {
        if (value.length === 0) {
            setErrors((prev) => ({ ...prev, tag: 'Name can not be empty.' }));
            return;
        }
        const newLegalValue: ILegalValue = {
            value,
            description,
        };
        setLegalValues([...legalValues, newLegalValue]);
        setValue('');
        setDescription('');
    };

    const onRemoveLegalValue = (val: ILegalValue) => {
        setLegalValues(legalValues.filter((l) => l.value !== val.value));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === ENTER) {
            e.preventDefault();
            onAddLegalValue();
        }
    };

    return (
        <StyledForm
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e);
            }}
        >
            <div>
                <StyledInputDescription>
                    What is the name of your context field?
                </StyledInputDescription>
                <Input
                    sx={styledInput}
                    label='Context field name'
                    value={contextName}
                    disabled={mode === 'Edit'}
                    onChange={(e) => setContextName(e.target.value.trim())}
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
                    label='Context description (optional)'
                    variant='outlined'
                    multiline
                    maxRows={4}
                    value={contextDesc}
                    size='small'
                    onChange={(e) => setContextDesc(e.target.value)}
                />

                <StyledInputDescription>
                    What is the type of your context field?
                </StyledInputDescription>
                {useValueType && (
                    <FormControl sx={styledInput} size='small'>
                        <InputLabel id='context-field-type-label'>
                            Context Field Type (optional)
                        </InputLabel>
                        <Select
                            labelId='context-field-type-label'
                            label='Context Field Type (optional)'
                            value={valueType || ''}
                            disabled={mode === 'Edit'}
                            onChange={(e) =>
                                setValueType(
                                    (e.target.value as ContextFieldType) ||
                                        undefined,
                                )
                            }
                        >
                            <MenuItem value=''>
                                <em>Undefined (all operators)</em>
                            </MenuItem>
                            <MenuItem value={'String'}>String</MenuItem>
                            <MenuItem value={'Number'}>Number</MenuItem>
                            <MenuItem value={'Semver'}>Semver</MenuItem>
                            <MenuItem value={'Date'}>Date</MenuItem>
                        </Select>
                    </FormControl>
                )}

                <StyledLegalValueContainer>
                    <StyledLegalValueHeader>
                        <Typography variant='body2'>
                            Do you want to define a set of legal values for this
                            context field? (optional)
                        </Typography>
                        <Link
                            href='https://docs.getunleash.io/reference/unleash-context#custom-context-fields'
                            target='_blank'
                            rel='noopener noreferrer'
                            sx={{ margin: (theme) => theme.spacing(0, 1) }}
                        >
                            Read more
                        </Link>
                    </StyledLegalValueHeader>
                    <StyledLegalValueInputContainer>
                        <TextField
                            label='Legal value (optional)'
                            name='value'
                            sx={{ gridColumn: 1 }}
                            value={value}
                            error={Boolean(errors.tag)}
                            helperText={errors.tag}
                            variant='outlined'
                            size='small'
                            onKeyDown={handleKeyDown}
                            onChange={(e) => setValue(e.target.value)}
                        />
                        <TextField
                            label='Description (optional)'
                            name='description'
                            sx={{ gridColumn: 1 }}
                            value={description}
                            variant='outlined'
                            size='small'
                            onKeyDown={handleKeyDown}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <Button
                            color='primary'
                            variant='contained'
                            onClick={onAddLegalValue}
                            sx={{ gridColumn: 2, justifySelf: 'flex-start' }}
                            startIcon={<Add />}
                        >
                            Add
                        </Button>
                    </StyledLegalValueInputContainer>
                    <StyledTagContainer>
                        <ContextFormChipList
                            legalValues={legalValues}
                            onRemove={onRemoveLegalValue}
                        />
                    </StyledTagContainer>
                </StyledLegalValueContainer>

                <Typography variant='body2' sx={{ mb: 1 }}>
                    Do you want this context field to be sticky? (optional)
                </Typography>
                <Switch
                    name='stickiness'
                    checked={stickiness}
                    onChange={(e) => setStickiness(e.target.checked)}
                />
                <ContextFieldUsage contextName={contextName} />
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
