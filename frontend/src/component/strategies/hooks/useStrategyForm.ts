import { ICustomStrategyParameter } from 'interfaces/strategy';
import { useEffect, useState } from 'react';
import useStrategies from 'hooks/api/getters/useStrategies/useStrategies';

export const useStrategyForm = (
    initialStrategyName: string = '',
    initialStrategyDesc: string = '',
    initialParams: ICustomStrategyParameter[] = []
) => {
    const [strategyName, setStrategyName] = useState(initialStrategyName);
    const [strategyDesc, setStrategyDesc] = useState(initialStrategyDesc);
    const [params, setParams] = useState(initialParams);
    const [errors, setErrors] = useState({});
    const { strategies } = useStrategies();

    useEffect(() => {
        setStrategyName(initialStrategyName);
        /* eslint-disable-next-line */
    }, [initialStrategyName]);

    useEffect(() => {
        setStrategyDesc(initialStrategyDesc);
        /* eslint-disable-next-line */
    }, [initialStrategyDesc]);

    useEffect(() => {
        setParams(initialParams);
        /* eslint-disable-next-line */
    }, [JSON.stringify(initialParams)]);

    const getStrategyPayload = () => {
        return {
            name: strategyName,
            description: strategyDesc,
            parameters: params,
        };
    };

    const validateStrategyName = () => {
        if (strategyName.length === 0) {
            setErrors(prev => ({ ...prev, name: 'Name can not be empty.' }));
            return false;
        }
        if (strategies.some(strategy => strategy.name === strategyName)) {
            setErrors(prev => ({
                ...prev,
                name: 'A strategy name with that name already exist',
            }));
            return false;
        }
        return true;
    };

    const validateParams = () => {
        let res = true;
        // eslint-disable-next-line
        for (const [index, p] of Object.entries(params)) {
            // eslint-disable-next-line
            params.forEach((p, index) => {
                if (p.name.length === 0) {
                    setErrors(prev => ({
                        ...prev,
                        [`paramName${index}`]: 'Name can not be empty',
                    }));
                    res = false;
                }
            });
        }
        return res;
    };

    const clearErrors = () => {
        setErrors({});
    };

    return {
        strategyName,
        strategyDesc,
        params,
        setStrategyName,
        setStrategyDesc,
        setParams,
        getStrategyPayload,
        validateStrategyName,
        validateParams,
        setErrors,
        clearErrors,
        errors,
    };
};
