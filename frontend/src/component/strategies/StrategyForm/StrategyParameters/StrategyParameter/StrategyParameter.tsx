import {
    Checkbox,
    Divider,
    FormControlLabel,
    IconButton,
    Tooltip,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useStyles } from './StrategyParameter.styles';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import Input from 'component/common/Input/Input';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import React from 'react';
import { IStrategyParameter } from 'interfaces/strategy';

const paramTypesOptions = [
    {
        key: 'string',
        label: 'string',
    },
    {
        key: 'percentage',
        label: 'percentage',
    },
    {
        key: 'list',
        label: 'list',
    },
    {
        key: 'number',
        label: 'number',
    },
    {
        key: 'boolean',
        label: 'boolean',
    },
];

interface IStrategyParameterProps {
    set: React.Dispatch<React.SetStateAction<object>>;
    input: IStrategyParameter;
    index: number;
    params: IStrategyParameter[];
    setParams: React.Dispatch<React.SetStateAction<IStrategyParameter[]>>;
    errors: { [key: string]: string };
}

export const StrategyParameter = ({
    set,
    input,
    index,
    params,
    setParams,
    errors,
}: IStrategyParameterProps) => {
    const { classes: styles } = useStyles();

    const onTypeChange = (type: string) => {
        set({ type });
    };

    return (
        <div className={styles.paramsContainer}>
            <Divider className={styles.divider} />
            <ConditionallyRender
                condition={index === 0}
                show={
                    <p className={styles.input}>
                        Parameters let you provide arguments to your strategy
                        that it can access for evaluation. Read more in the{' '}
                        <a
                            href="https://docs.getunleash.io/advanced/custom_activation_strategy#parameter-types"
                            target="_blank"
                            rel="noreferrer"
                        >
                            parameter types documentation
                        </a>
                        .
                    </p>
                }
            />
            <div className={styles.nameContainer}>
                <Input
                    autoFocus
                    label={`Parameter name ${index + 1}*`}
                    onChange={e => set({ name: e.target.value })}
                    value={input.name}
                    className={styles.name}
                    error={Boolean(errors?.[`paramName${index}`])}
                    errorText={errors?.[`paramName${index}`]}
                />
                <Tooltip title="Remove parameter" arrow>
                    <IconButton
                        onClick={() => {
                            setParams(params.filter((e, i) => i !== index));
                        }}
                        size="large"
                    >
                        <Delete />
                    </IconButton>
                </Tooltip>
            </div>
            <GeneralSelect
                label="Type*"
                name="type"
                options={paramTypesOptions}
                value={input.type}
                onChange={onTypeChange}
                id={`prop-type-${index}-select`}
                className={styles.input}
            />
            <Input
                rows={2}
                multiline
                label={`Parameter name ${index + 1} description`}
                onChange={({ target }) => set({ description: target.value })}
                value={input.description}
                className={styles.description}
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={Boolean(input.required)}
                        onChange={() => set({ required: !input.required })}
                    />
                }
                label="Required"
                className={styles.checkboxLabel}
            />
        </div>
    );
};
