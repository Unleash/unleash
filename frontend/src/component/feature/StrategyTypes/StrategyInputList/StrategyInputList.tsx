import React, { ChangeEvent, useState } from 'react';
import {
    Button,
    Chip,
    TextField,
    Typography,
    styled,
    TextFieldProps,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ADD_TO_STRATEGY_INPUT_LIST, STRATEGY_INPUT_LIST } from 'utils/testIds';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { IFormErrors } from 'hooks/useFormErrors';

interface IStrategyInputList {
    name: string;
    list: string[];
    setConfig: (field: string, value: string) => void;
    disabled: boolean;
    errors: IFormErrors;
}

const Container = styled('div')(({ theme }) => ({
    display: 'grid',
    gap: theme.spacing(1),
}));

const ChipsList = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
}));

const InputContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'start',
}));

const StrategyInputList = ({
    name,
    list,
    setConfig,
    disabled,
    errors,
}: IStrategyInputList) => {
    const [input, setInput] = useState('');
    const ENTERKEY = 'Enter';

    const onBlur = (e: ChangeEvent) => {
        setValue(e);
    };

    const onKeyDown = (e: ChangeEvent) => {
        // @ts-expect-error
        if (e?.key === ENTERKEY) {
            setValue(e);
            e.preventDefault();
            e.stopPropagation();
        }
    };

    const setValue = (evt: ChangeEvent) => {
        evt.preventDefault();
        // @ts-expect-error
        const value = evt.target.value;

        if (value) {
            const newValues = value
                .split(/,\s*/)
                // @ts-expect-error
                .filter(a => !list.includes(a));
            if (newValues.length > 0) {
                const newList = list.concat(newValues).filter(a => a);
                setConfig(name, newList.join(','));
            }
            setInput('');
        }
    };

    const onClose = (index: number) => {
        // @ts-expect-error
        list[index] = null;
        setConfig(
            name,
            list.length === 1 ? '' : list.filter(Boolean).join(',')
        );
    };

    const onChange: TextFieldProps['onChange'] = event => {
        setInput(event.currentTarget.value);
    };

    return (
        <Container>
            <Typography variant="subtitle2" component="h2">
                List of {name}
            </Typography>
            <ConditionallyRender
                condition={list.length > 0}
                show={
                    <ChipsList>
                        {list.map((entryValue, index) => (
                            <Chip
                                key={index + entryValue}
                                label={
                                    <StringTruncator
                                        maxWidth="300"
                                        text={entryValue}
                                        maxLength={50}
                                    />
                                }
                                onDelete={
                                    disabled ? undefined : () => onClose(index)
                                }
                                title="Remove value"
                            />
                        ))}
                    </ChipsList>
                }
            />
            <ConditionallyRender
                condition={!disabled}
                show={
                    <InputContainer>
                        <TextField
                            error={Boolean(errors.getFormError(name))}
                            helperText={errors.getFormError(name)}
                            name={`input_field`}
                            variant="outlined"
                            label="Add items"
                            id="input-add-items"
                            value={input}
                            size="small"
                            placeholder=""
                            onBlur={onBlur}
                            onChange={onChange}
                            // @ts-expect-error
                            onKeyDown={onKeyDown}
                            data-testid={STRATEGY_INPUT_LIST}
                        />
                        {/* @ts-expect-error */}
                        <Button
                            onClick={setValue}
                            data-testid={ADD_TO_STRATEGY_INPUT_LIST}
                            variant="outlined"
                            color="secondary"
                            startIcon={<Add />}
                        >
                            Add
                        </Button>
                    </InputContainer>
                }
            />
        </Container>
    );
};

export default StrategyInputList;
