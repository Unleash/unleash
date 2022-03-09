import React from 'react';
import { IStrategy } from '../../../../interfaces/strategy';

interface IDefaultStrategyProps {
    strategyDefinition: IStrategy;
}

const DefaultStrategy = ({ strategyDefinition }: IDefaultStrategyProps) => {
    return <h6>{strategyDefinition?.description}</h6>;
};

export default DefaultStrategy;
