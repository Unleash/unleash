import type { ReactNode } from 'react';

export interface IFilterItemProps {
    label: ReactNode;
    options: Array<{ label: string; value: string }>;
    selectedOptions: Set<string>;
    onChange: (values: Set<string>) => void;
}

export type FilterItemParams = {
    operator: string;
    values: string[];
};
