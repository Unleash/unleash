import React, { ChangeEvent, useState } from 'react';
import { Button, Chip, TextField, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ADD_TO_STRATEGY_INPUT_LIST, STRATEGY_INPUT_LIST } from 'utils/testIds';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';

interface IStrategyInputList {
    name: string;
    list: string[];
    setConfig: (field: string, value: string) => void;
    disabled: boolean;
}

const StrategyInputList = ({
    name,
    list,
    setConfig,
    disabled,
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

    // @ts-expect-error
    const onChange = e => {
        setInput(e.currentTarget.value);
    };

    return (
        <div>
            <Typography variant="subtitle2" component="h2">
                List of {name}
            </Typography>
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    margin: '10px 0',
                }}
            >
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
                        style={{ marginRight: '3px' }}
                        onDelete={disabled ? undefined : () => onClose(index)}
                        title="Remove value"
                    />
                ))}
            </div>
            <ConditionallyRender
                condition={!disabled}
                show={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
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
                            color="secondary"
                            startIcon={<Add />}
                        >
                            Add
                        </Button>
                    </div>
                }
            />
        </div>
    );
};

export default StrategyInputList;
