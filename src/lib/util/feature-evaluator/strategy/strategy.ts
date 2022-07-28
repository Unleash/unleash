import { PlaygroundConstraintSchema } from 'lib/openapi/spec/playground-feature-schema';
import { gt as semverGt, lt as semverLt, eq as semverEq } from 'semver';
import { StrategyEvaluationResult } from '../client';
import { Context } from '../context';
import { resolveContextValue } from '../helpers';

export interface StrategyTransportInterface {
    name: string;
    parameters: any;
    constraints: Constraint[];
}

export interface Constraint {
    contextName: string;
    operator: Operator;
    inverted: boolean;
    values: string[];
    value?: string | number | Date;
    caseInsensitive?: boolean;
}

export interface Segment {
    id: number;
    name: string;
    description?: string;
    constraints: Constraint[];
    createdBy: string;
    createdAt: string;
}

export enum Operator {
    IN = 'IN',
    NOT_IN = 'NOT_IN',
    STR_ENDS_WITH = 'STR_ENDS_WITH',
    STR_STARTS_WITH = 'STR_STARTS_WITH',
    STR_CONTAINS = 'STR_CONTAINS',
    NUM_EQ = 'NUM_EQ',
    NUM_GT = 'NUM_GT',
    NUM_GTE = 'NUM_GTE',
    NUM_LT = 'NUM_LT',
    NUM_LTE = 'NUM_LTE',
    DATE_AFTER = 'DATE_AFTER',
    DATE_BEFORE = 'DATE_BEFORE',
    SEMVER_EQ = 'SEMVER_EQ',
    SEMVER_GT = 'SEMVER_GT',
    SEMVER_LT = 'SEMVER_LT',
}

export type OperatorImpl = (
    constraint: Constraint,
    context: Context,
) => boolean;

const cleanValues = (values: string[]) =>
    values.filter((v) => !!v).map((v) => v.trim());

const InOperator = (constraint: Constraint, context: Context) => {
    const field = constraint.contextName;
    const values = cleanValues(constraint.values);
    const contextValue = resolveContextValue(context, field);

    const isIn = values.some((val) => val === contextValue);
    return constraint.operator === Operator.IN ? isIn : !isIn;
};

const StringOperator = (constraint: Constraint, context: Context) => {
    const { contextName, operator, caseInsensitive } = constraint;
    let values = cleanValues(constraint.values);
    let contextValue = resolveContextValue(context, contextName);

    if (caseInsensitive) {
        values = values.map((v) => v.toLocaleLowerCase());
        contextValue = contextValue?.toLocaleLowerCase();
    }

    if (operator === Operator.STR_STARTS_WITH) {
        return values.some((val) => contextValue?.startsWith(val));
    }
    if (operator === Operator.STR_ENDS_WITH) {
        return values.some((val) => contextValue?.endsWith(val));
    }
    if (operator === Operator.STR_CONTAINS) {
        return values.some((val) => contextValue?.includes(val));
    }
    return false;
};

const SemverOperator = (constraint: Constraint, context: Context) => {
    const { contextName, operator } = constraint;
    const value = constraint.value as string;
    const contextValue = resolveContextValue(context, contextName);
    if (!contextValue) {
        return false;
    }

    try {
        if (operator === Operator.SEMVER_EQ) {
            return semverEq(contextValue, value);
        }
        if (operator === Operator.SEMVER_LT) {
            return semverLt(contextValue, value);
        }
        if (operator === Operator.SEMVER_GT) {
            return semverGt(contextValue, value);
        }
    } catch (e) {
        return false;
    }
    return false;
};

const DateOperator = (constraint: Constraint, context: Context) => {
    const { operator } = constraint;
    const value = new Date(constraint.value as string);
    const currentTime = context.currentTime
        ? new Date(context.currentTime)
        : new Date();

    if (operator === Operator.DATE_AFTER) {
        return currentTime > value;
    }
    if (operator === Operator.DATE_BEFORE) {
        return currentTime < value;
    }
    return false;
};

const NumberOperator = (constraint: Constraint, context: Context) => {
    const field = constraint.contextName;
    const { operator } = constraint;
    const value = Number(constraint.value);
    const contextValue = Number(resolveContextValue(context, field));

    if (Number.isNaN(value) || Number.isNaN(contextValue)) {
        return false;
    }

    if (operator === Operator.NUM_EQ) {
        return contextValue === value;
    }
    if (operator === Operator.NUM_GT) {
        return contextValue > value;
    }
    if (operator === Operator.NUM_GTE) {
        return contextValue >= value;
    }
    if (operator === Operator.NUM_LT) {
        return contextValue < value;
    }
    if (operator === Operator.NUM_LTE) {
        return contextValue <= value;
    }
    return false;
};

const operators = new Map<Operator, OperatorImpl>();
operators.set(Operator.IN, InOperator);
operators.set(Operator.NOT_IN, InOperator);
operators.set(Operator.STR_STARTS_WITH, StringOperator);
operators.set(Operator.STR_ENDS_WITH, StringOperator);
operators.set(Operator.STR_CONTAINS, StringOperator);
operators.set(Operator.NUM_EQ, NumberOperator);
operators.set(Operator.NUM_LT, NumberOperator);
operators.set(Operator.NUM_LTE, NumberOperator);
operators.set(Operator.NUM_GT, NumberOperator);
operators.set(Operator.NUM_GTE, NumberOperator);
operators.set(Operator.DATE_AFTER, DateOperator);
operators.set(Operator.DATE_BEFORE, DateOperator);
operators.set(Operator.SEMVER_EQ, SemverOperator);
operators.set(Operator.SEMVER_GT, SemverOperator);
operators.set(Operator.SEMVER_LT, SemverOperator);
export class Strategy {
    public name: string;

    private returnValue: boolean;

    constructor(name: string, returnValue: boolean = false) {
        this.name = name || 'unknown';
        this.returnValue = returnValue;
    }

    checkConstraint(constraint: Constraint, context: Context) {
        const evaluator = operators.get(constraint.operator);

        if (!evaluator) {
            return false;
        }

        if (constraint.inverted) {
            return !evaluator(constraint, context);
        }

        return evaluator(constraint, context);
    }

    checkConstraints(
        context: Context,
        constraints?: Constraint[],
    ): { result: boolean; constraints: PlaygroundConstraintSchema[] } {
        if (!constraints || constraints.length === 0) {
            return {
                result: true,
                constraints: [],
                // reasons: ['This strategy has no constraints'],
            };
        }

        const mappedConstraints = constraints.map((constraint) => ({
            ...constraint,
            value: constraint.value?.toString() ?? undefined,
            result: this.checkConstraint(constraint, context),
        }));

        const result = mappedConstraints.every(
            (constraint) => constraint.result,
        );

        // if (old !== result) {
        //     console.log('used to be:', old, "now it's", result);
        // }

        // console.log(constraints, mappedConstraints, result);

        return {
            result,
            constraints: mappedConstraints,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isEnabled(parameters: any, context: Context): StrategyEvaluationResult {
        // console.log('strategy.isEnabled');

        return {
            result: this.returnValue,
        };
    }

    isEnabledWithConstraints(
        parameters: any,
        context: Context,
        constraints: Constraint[] = [],
    ): StrategyEvaluationResult {
        const constraintResults = this.checkConstraints(context, constraints);
        const enabledResult = this.isEnabled(parameters, context);

        // console.log('constraints', constraintResults, 'enabled', enabledResult);

        if (constraintResults.result && enabledResult.result) {
            return {
                result: true,
                constraints: constraintResults.constraints,
                // reasons: [
                //     ...constraintResults.reasons,
                //     ...enabledResult.reasons,
                // ],
            };
        } else {
            const result = {
                result: false,
                constraints: constraintResults.constraints,
                // reasons: [
                //     ...(!constraintResults.enabled
                //         ? constraintResults.reasons
                //         : []),
                //     ...(!enabledResult.enabled ? enabledResult.reasons : []),
                // ],
            };

            // if (!constraintResults.enabled) {
            //     console.log(
            //         'contsraint results',
            //         constraintResults,
            //         result.reasons,
            //     );
            // }

            return result;
        }
    }
}
