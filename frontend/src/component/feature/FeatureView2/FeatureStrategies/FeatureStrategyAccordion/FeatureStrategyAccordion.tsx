import { IConstraint, IParameter, IFeatureStrategy } from '../../../../../interfaces/strategy';

import Accordion from '@material-ui/core/Accordion';
import { AccordionDetails, AccordionSummary } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { getFeatureStrategyIcon, getHumanReadbleStrategyName } from '../../../../../utils/strategy-names';
import { useStyles } from './FeatureStrategyAccordion.styles';
import ConditionallyRender from '../../../../common/ConditionallyRender';
import FeatureStrategyAccordionBody from './FeatureStrategyAccordionBody/FeatureStrategyAccordionBody';
import React from 'react';

interface IFeatureStrategyAccordionProps {
    strategy: IFeatureStrategy;
    expanded?: boolean;
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
    actions,
    children,
}) => {
    const styles = useStyles();
    const strategyName = getHumanReadbleStrategyName(strategy.name);
    const Icon = getFeatureStrategyIcon(strategy.name);

    const updateParameters = (field: string, value: any) => {
        setStrategyParams({ ...parameters, [field]: value });
    };

    const updateConstraints = (constraints: IConstraint[]) => {
        setStrategyConstraints(constraints);
    };

    return (
        <div className={styles.container}>
            <Accordion className={styles.accordion} defaultExpanded={expanded}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="strategy-content"
                    id={strategy.name}
                >
                    <div className={styles.accordionSummary}>
                        <p className={styles.accordionHeader}>
                            <Icon className={styles.icon} /> {strategyName}
                        </p>

                        <ConditionallyRender
                            condition={Boolean(parameters?.rollout)}
                            show={
                                <p className={styles.rollout}>
                                    Rolling out to {parameters?.rollout}%
                                </p>
                            }
                        />

                        <div className={styles.accordionActions}>{actions}</div>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    <FeatureStrategyAccordionBody
                        strategy={{ ...strategy, parameters }}
                        updateParameters={updateParameters}
                        updateConstraints={updateConstraints}
                        constraints={constraints}
                        setStrategyConstraints={setStrategyConstraints}
                    >
                        {children}
                    </FeatureStrategyAccordionBody>
                </AccordionDetails>
            </Accordion>
        </div>
    );
};

export default FeatureStrategyAccordion;
