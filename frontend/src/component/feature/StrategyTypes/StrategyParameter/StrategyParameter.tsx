import React from 'react';
import { FormControlLabel, Switch, TextField } from '@mui/material';
import StrategyInputList from '../StrategyInputList/StrategyInputList';
import RolloutSlider from '../RolloutSlider/RolloutSlider';
import {
    IFeatureStrategyParameters,
    IStrategyParameter,
} from 'interfaces/strategy';
import {
    parseParameterNumber,
    parseParameterStrings,
    parseParameterString,
} from 'utils/parseParameter';
import { InputCaption } from 'component/common/InputCaption/InputCaption';
import { IFormErrors } from 'hooks/useFormErrors';

interface IStrategyParameterProps {
    definition: IStrategyParameter;
    parameters: IFeatureStrategyParameters;
    updateParameter: (field: string, value: string) => void;
    editable: boolean;
    errors: IFormErrors;
}

export const StrategyParameter = ({
    definition,
    parameters,
    updateParameter,
    editable,
    errors,
}: IStrategyParameterProps) => {
    const { type, name, description, required } = definition;
    const value = parameters[name];
    const error = errors.getFormError(name);
    const label = required ? `${name} * ` : name;

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        updateParameter(name, event.target.value);
    };

    const onChangeString = (event: React.ChangeEvent<HTMLInputElement>) => {
        updateParameter(name, parseParameterString(event.target.value));
    };

    const onChangePercentage = (event: Event, next: number | number[]) => {
        updateParameter(name, next.toString());
    };

    const onChangeBoolean = (event: React.ChangeEvent, checked: boolean) => {
        updateParameter(name, String(checked));
    };

    const onSetListConfig = (field: string, value: string) => {
        updateParameter(field, parseParameterStrings(value).join(','));
    };

    if (type === 'percentage') {
        return (
            <div>
                <RolloutSlider
                    name={name}
                    onChange={onChangePercentage}
                    disabled={!editable}
                    value={parseParameterNumber(parameters[name])}
                    minLabel="off"
                    maxLabel="on"
                />
                <InputCaption text={description} />
            </div>
        );
    }

    if (type === 'list') {
        return (
            <div>
                <StrategyInputList
                    name={name}
                    list={parseParameterStrings(parameters[name])}
                    disabled={!editable}
                    setConfig={onSetListConfig}
                    errors={errors}
                />
                <InputCaption text={description} />
            </div>
        );
    }

    if (type === 'number') {
        return (
            <div>
                <TextField
                    error={Boolean(error)}
                    helperText={error}
                    variant="outlined"
                    size="small"
                    aria-required={required}
                    style={{ width: '100%' }}
                    disabled={!editable}
                    label={label}
                    onChange={onChange}
                    value={value}
                />
                <InputCaption text={description} />
            </div>
        );
    }

    if (type === 'boolean') {
        const value = parseParameterString(parameters[name]);
        const checked = value === 'true';
        return (
            <div>
                <FormControlLabel
                    label={name}
                    control={
                        <Switch
                            name={name}
                            onChange={onChangeBoolean}
                            checked={checked}
                        />
                    }
                />
                <InputCaption text={description} />
            </div>
        );
    }

    return (
        <div>
            <TextField
                rows={1}
                placeholder=""
                variant="outlined"
                size="small"
                style={{ width: '100%' }}
                aria-required={required}
                disabled={!editable}
                error={Boolean(error)}
                helperText={error}
                name={name}
                label={label}
                onChange={onChangeString}
                value={parseParameterString(parameters[name])}
            />
            <InputCaption text={description} />
        </div>
    );
};
