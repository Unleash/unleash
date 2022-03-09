import {
    IConstraint,
    IParameter,
    IFeatureStrategy,
} from '../../../../../interfaces/strategy';

import Accordion from '@material-ui/core/Accordion';
import {
    AccordionDetails,
    AccordionSummary,
    useMediaQuery,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {
    getFeatureStrategyIcon,
    getHumanReadableStrategyName,
} from '../../../../../utils/strategy-names';
import { useStyles } from './FeatureStrategyAccordion.styles';
import ConditionallyRender from '../../../../common/ConditionallyRender';
import FeatureStrategyAccordionBody from './FeatureStrategyAccordionBody/FeatureStrategyAccordionBody';
import React from 'react';

interface IFeatureStrategyAccordionProps {
    strategy: IFeatureStrategy;
    expanded?: boolean;
    create?: boolean;
    parameters: IParameter;
    constraints: IConstraint[];
    setStrategyParams: (paremeters: IParameter, strategyId?: string) => any;
    setStrategyConstraints: React.Dispatch<React.SetStateAction<IConstraint[]>>;
    updateStrategy?: (strategyId: string) => void;
    actions?: JSX.Element | JSX.Element[];
}

const FeatureStrategyAccordion: React.FC<IFeatureStrategyAccordionProps> = ({
    strategy,
    expanded = false,
    setStrategyParams,
    parameters,
    constraints,
    setStrategyConstraints,
    // @ts-expect-error
    localConstraints,
    // @ts-expect-error
    setLocalConstraints,
    actions,
    children,
    create = false,
    ...rest
}) => {
    const smallScreen = useMediaQuery('(max-width:500px)');
    const styles = useStyles();
    const strategyName = getHumanReadableStrategyName(strategy.name);
    const Icon = getFeatureStrategyIcon(strategy.name);

    const updateParameters = (field: string, value: any) => {
        setStrategyParams({ ...parameters, [field]: value });
    };

    const updateConstraints = (constraints: IConstraint[]) => {
        setStrategyConstraints(constraints);
    };

    return (
        <div className={styles.container} {...rest}>
            <Accordion className={styles.accordion} defaultExpanded={expanded}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="strategy-content"
                    id={strategy.name}
                >
                    <div className={styles.accordionSummary}>
                        <Icon className={styles.icon} />

                        <p className={styles.accordionHeader}>{strategyName}</p>

                        <ConditionallyRender
                            condition={
                                Boolean(parameters?.rollout) && !smallScreen
                            }
                            show={
                                <p className={styles.rollout}>
                                    Rolling out to {parameters?.rollout}%
                                </p>
                            }
                        />

                        <div className={styles.accordionActions}>{actions}</div>
                    </div>
                </AccordionSummary>
                <AccordionDetails className={styles.accordionDetails}>
                    <FeatureStrategyAccordionBody
                        strategy={{ ...strategy, parameters }}
                        updateParameters={updateParameters}
                        updateConstraints={updateConstraints}
                        constraints={constraints}
                        setStrategyConstraints={setStrategyConstraints}
                        // @ts-expect-error
                        localConstraints={localConstraints}
                        setLocalConstraints={setLocalConstraints}
                        create={create}
                    >
                        {children}
                    </FeatureStrategyAccordionBody>
                </AccordionDetails>
            </Accordion>
        </div>
    );
};

export default FeatureStrategyAccordion;
