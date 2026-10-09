// TODO: delete with Legacy*.tsx forks once singlePageStrategyForm is fully rolled out
import { useUiFlag } from 'hooks/useUiFlag';
import type { StrategyFormState } from 'interfaces/strategy';
import {
    StrategyFormBody,
    type StrategyFormBodyProps,
} from './StrategyFormBody.tsx';
import { LegacyStrategyFormBody } from './LegacyStrategyFormBody.tsx';

export const StrategyFormBodySelector = <T extends StrategyFormState>(
    props: StrategyFormBodyProps<T>,
) => {
    const singlePageStrategyForm = useUiFlag('singlePageStrategyForm');
    return singlePageStrategyForm ? (
        <StrategyFormBody {...props} />
    ) : (
        <LegacyStrategyFormBody {...props} />
    );
};
