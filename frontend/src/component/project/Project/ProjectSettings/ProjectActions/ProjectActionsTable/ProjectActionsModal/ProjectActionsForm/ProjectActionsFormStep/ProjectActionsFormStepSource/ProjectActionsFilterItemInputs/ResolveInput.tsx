import {
    isInOperator,
    isNumOperator,
    isSemVerOperator,
    isStringOperator,
    type Operator,
} from 'constants/operators';
import type { IConstraint } from 'interfaces/strategy.ts';
import { FreeTextInput } from './FreeTextInput/FreeTextInput.tsx';
import { SingleValue } from './SingleValue/SingleValue.tsx';

interface IResolveInputProps {
    localConstraint: Pick<IConstraint, 'value' | 'values'>;
    setValue: (value: string) => void;
    setValues: (values: string[]) => void;
    setError: React.Dispatch<React.SetStateAction<string>>;
    removeValue: (index: number) => void;
    operator: Operator;
    error: string;
}

export const ResolveInput = ({
    operator,
    localConstraint,
    setValue,
    setValues,
    setError,
    removeValue,
    error,
}: IResolveInputProps) => {
    if (isInOperator(operator)) {
        return (
            <FreeTextInput
                values={localConstraint.values || []}
                removeValue={removeValue}
                setValues={setValues}
                error={error}
                setError={setError}
            />
        );
    }

    if (isStringOperator(operator)) {
        return (
            <FreeTextInput
                values={localConstraint.values || []}
                removeValue={removeValue}
                setValues={setValues}
                error={error}
                setError={setError}
            />
        );
    }

    if (isNumOperator(operator)) {
        return (
            <SingleValue
                setValue={setValue}
                value={localConstraint.value}
                type='number'
                error={error}
                setError={setError}
            />
        );
    }

    if (isSemVerOperator(operator)) {
        return (
            <SingleValue
                setValue={setValue}
                value={localConstraint.value}
                type='semver'
                error={error}
                setError={setError}
            />
        );
    }
};
