import React, { Fragment, VFC } from 'react';
import {
    parseParameterNumber,
    parseParameterString,
    parseParameterStrings,
} from 'utils/parseParameter';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import { useStrategies } from 'hooks/api/getters/useStrategies/useStrategies';
import { CustomParameterItem } from './CustomParameterItem/CustomParameterItem';

interface ICustomStrategyProps {
    parameters: { [key: string]: string };
    strategyName: string;
}

export const CustomStrategyParams: VFC<ICustomStrategyProps> = ({
    strategyName,
    parameters,
}) => {
    const { strategies } = useStrategies();
    const definition = strategies.find(strategyDefinition => {
        return strategyDefinition.name === strategyName;
    });

    if (!definition?.editable) {
        return null;
    }

    const items = definition?.parameters.map(param => {
        const paramValue = parameters[param.name];
        const isRequired = param.required;

        switch (param?.type) {
            case 'list':
                const values = parseParameterStrings(paramValue);
                return (
                    <CustomParameterItem
                        isRequired={isRequired}
                        text={param.name}
                        input={values?.length > 0 ? values.join(', ') : null}
                    />
                );
            case 'percentage':
                const percentage = parseParameterNumber(paramValue);
                const correctPercentage = !(
                    paramValue === undefined ||
                    paramValue === '' ||
                    percentage < 0 ||
                    percentage > 100
                );
                return (
                    <CustomParameterItem
                        text={param.name}
                        isRequired={isRequired}
                        input={correctPercentage ? `${percentage}%` : undefined}
                    />
                );
            case 'boolean':
                const bool = ['true', 'false'].includes(paramValue)
                    ? paramValue
                    : undefined;
                return (
                    <CustomParameterItem
                        isRequired={isRequired}
                        text={param.name}
                        input={paramValue !== undefined ? bool : undefined}
                    />
                );
            case 'string':
                const value = parseParameterString(paramValue);
                return (
                    <CustomParameterItem
                        text={param.name}
                        isRequired={isRequired}
                        input={value !== undefined ? value : undefined}
                    />
                );
            case 'number':
                const isCorrect = !(
                    paramValue === undefined || paramValue === ''
                );
                const number = parseParameterNumber(paramValue);
                return (
                    <CustomParameterItem
                        text={param.name}
                        isRequired={isRequired}
                        input={isCorrect ? `${number}` : undefined}
                    />
                );
            case 'default':
                return null;
        }
        return null;
    });

    return (
        <>
            {items.map((item, index) => (
                <Fragment key={index}>
                    <ConditionallyRender
                        condition={index > 0}
                        show={<StrategySeparator text="AND" />}
                    />
                    {item}
                </Fragment>
            ))}
        </>
    );
};
