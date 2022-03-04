import { Checkbox, FormControlLabel, IconButton } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import { useStyles } from './StrategyParameter.styles';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import Input from 'component/common/Input/Input';
import ConditionallyRender from 'component/common/ConditionallyRender';
import React from 'react';
import { ICustomStrategyParameter } from 'interfaces/strategy';

const paramTypesOptions = [
    {
        key: 'string',
        label: 'string',
        description: 'A string is a collection of characters',
    },
    {
        key: 'percentage',
        label: 'percentage',
        description:
            'Percentage is used when you want to make your feature visible to a process part of your customers',
    },
    {
        key: 'list',
        label: 'list',
        description:
            'A list is used when you want to define several parameters that must be met before your feature becomes visible to your customers',
    },
    {
        key: 'number',
        label: 'number',
        description:
            'Number is used when you have one or more digits that must be met for your feature to be visible to your customers',
    },
    {
        key: 'boolean',
        label: 'boolean',
        description:
            'A boolean value represents a truth value, which is either true or false',
    },
];

interface IStrategyParameterProps {
    set: React.Dispatch<React.SetStateAction<object>>;
    input: ICustomStrategyParameter;
    index: number;
    params: ICustomStrategyParameter[];
    setParams: React.Dispatch<React.SetStateAction<ICustomStrategyParameter[]>>;
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
    const styles = useStyles();
    const handleTypeChange = (
        event: React.ChangeEvent<{ name?: string; value: unknown }>
    ) => {
        set({ type: event.target.value });
    };

    const renderParamTypeDescription = () => {
        return paramTypesOptions.find(param => param.key === input.type)
            ?.description;
    };

    return (
        <div className={styles.paramsContainer}>
            <hr className={styles.divider} />
            <ConditionallyRender
                condition={index === 0}
                show={
                    <p className={styles.input}>
                        The parameters define how the strategy will look like.
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
                <IconButton
                    onClick={() => {
                        setParams(params.filter((e, i) => i !== index));
                    }}
                >
                    <Delete titleAccess="Delete" />
                </IconButton>
            </div>
            <GeneralSelect
                label="Type*"
                name="type"
                options={paramTypesOptions}
                value={input.type}
                onChange={handleTypeChange}
                id={`prop-type-${index}-select`}
                className={styles.input}
            />
            <p className={styles.typeDescription}>
                {renderParamTypeDescription()}
            </p>
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
