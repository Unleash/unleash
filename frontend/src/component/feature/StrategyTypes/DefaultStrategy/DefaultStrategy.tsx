import React from 'react';
import { IStrategy } from 'interfaces/strategy';

interface IDefaultStrategyProps {
    strategyDefinition: IStrategy;
}

const DefaultStrategy = ({ strategyDefinition }: IDefaultStrategyProps) => {
    return <p>{strategyDefinition?.description}</p>;
};

export default DefaultStrategy;
