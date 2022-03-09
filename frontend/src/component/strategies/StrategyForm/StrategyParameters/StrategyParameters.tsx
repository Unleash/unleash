import { StrategyParameter } from './StrategyParameter/StrategyParameter';
import React from 'react';
import { ICustomStrategyParameter } from 'interfaces/strategy';

interface IStrategyParametersProps {
    input: ICustomStrategyParameter[];
    updateParameter: (index: number, updated: object) => void;
    setParams: React.Dispatch<React.SetStateAction<ICustomStrategyParameter[]>>;
    errors: { [key: string]: string };
}

export const StrategyParameters = ({
    input = [],
    updateParameter,
    setParams,
    errors,
}: IStrategyParametersProps) => (
    <div>
        {input.map((item, index) => (
            <StrategyParameter
                params={input}
                key={index}
                set={value => updateParameter(index, value)}
                index={index}
                input={input[index]}
                setParams={setParams}
                errors={errors}
            />
        ))}
    </div>
);
