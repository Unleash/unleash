import {
    parseParameterNumber,
    parseParameterString,
    parseParameterStrings,
} from 'utils/parseParameter';
import React, { Fragment } from 'react';
import { PlaygroundParameterItem } from '../PlaygroundParamteterItem/PlaygroundParameterItem';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import {Chip} from '@mui/material';
import PercentageCircle from 'component/common/PercentageCircle/PercentageCircle';
import { PlaygroundConstraintSchema } from 'hooks/api/actions/usePlayground/playground.model';
import { useStrategies } from 'hooks/api/getters/useStrategies/useStrategies';

interface PlaygroundResultStrategyExecutionCustomStrategyProps {
    parameters: { [key: string]: string };
    strategyName: string;
    constraints: PlaygroundConstraintSchema[];
}

export const PlaygroundResultStrategyExecutionCustomStrategyParams = ({
    strategyName,
    constraints,
    parameters,
}: PlaygroundResultStrategyExecutionCustomStrategyProps) => {
    const { strategies } = useStrategies();
    const definition = strategies.find(strategyDefinition => {
        return strategyDefinition.name === strategyName;
    });

    if (!definition?.editable) {
        return null;
    }

    const renderCustomStrategyParameters = () => {
        return definition?.parameters.map((param: any, index: number) => {
            const notLastItem = index !== definition?.parameters?.length - 1;
            switch (param?.type) {
                case 'list':
                    const values = parseParameterStrings(
                        parameters[param.name]
                    );
                    return (
                        <Fragment key={param?.name}>
                            <PlaygroundParameterItem
                                value={values}
                                text={param.name}
                            />
                            <ConditionallyRender
                                condition={notLastItem}
                                show={<StrategySeparator text="AND" />}
                            />
                        </Fragment>
                    );
                case 'percentage':
                    return (
                        <Fragment key={param?.name}>
                            <div>
                                <Chip
                                    size="small"
                                    variant="outlined"
                                    color="success"
                                    label={`${parameters[param.name]}%`}
                                />{' '}
                                of your base{' '}
                                {constraints?.length > 0
                                    ? 'who match constraints'
                                    : ''}{' '}
                                is included.
                            </div>
                            <PercentageCircle
                                percentage={parseParameterNumber(
                                    parameters[param.name]
                                )}
                            />
                            <ConditionallyRender
                                condition={notLastItem}
                                show={<StrategySeparator text="AND" />}
                            />
                        </Fragment>
                    );
                case 'boolean':
                    const bool = Boolean(parameters[param?.name]);
                    return (
                        <Fragment key={param?.name}>
                            <PlaygroundParameterItem
                                value={bool ? ['True'] : []}
                                text={param.name}
                                showReason={!bool}
                                input={bool ? bool : 'no value'}
                            />
                            <ConditionallyRender
                                condition={notLastItem}
                                show={<StrategySeparator text="AND" />}
                            />
                        </Fragment>
                    );
                case 'string':
                    const value = parseParameterString(parameters[param.name]) ?? 'no value';
                    return (
                        <Fragment key={param?.name}>
                            <PlaygroundParameterItem
                                value={value !== '' ? [value] : []}
                                text={param.name}
                                showReason={value === ''}
                                input={value !== '' ? value : 'no value'}
                            />
                            <ConditionallyRender
                                condition={notLastItem}
                                show={<StrategySeparator text="AND" />}
                            />
                        </Fragment>
                    );
                case 'number':
                    const number = parseParameterNumber(parameters[param.name]);
                    return (
                        <Fragment key={param?.name}>
                            <PlaygroundParameterItem
                                value={Boolean(number) ? [number] : []}
                                text={param.name}
                                showReason={Boolean(number)}
                                input={Boolean(number) ? number : 'no value'}
                            />
                            <ConditionallyRender
                                condition={notLastItem}
                                show={<StrategySeparator text="AND" />}
                            />
                        </Fragment>
                    );
                case 'default':
                    return null;
            }
            return null;
        });
    };

    return <>{renderCustomStrategyParameters()}</>;
};
