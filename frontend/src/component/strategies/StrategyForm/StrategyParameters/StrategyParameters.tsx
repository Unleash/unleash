import { StrategyParameter } from './StrategyParameter/StrategyParameter';
import React from 'react';
import { IStrategyParameter } from 'interfaces/strategy';

interface IStrategyParametersProps {
    input: IStrategyParameter[];
    updateParameter: (index: number, updated: object) => void;
    setParams: React.Dispatch<React.SetStateAction<IStrategyParameter[]>>;
    errors: { [key: string]: string };
}

export const StrategyParameters = ({
    input = [],
    updateParameter,
    setParams,
    errors,
}: IStrategyParametersProps) => (
    <div style={{ marginTop: '0.5rem' }}>
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
