import { useMemo } from 'react';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import type { ColumnSizingState } from '@tanstack/react-table';

const DEFAULT_COLUMN_SIZES: Record<string, number> = {
    select: 50,
    favorite: 60,
    name: 300,
    createdAt: 150,
    createdBy: 100,
    lastSeenAt: 150,
    lifecycle: 150,
    actions: 100,
};

const getEnvironmentColumnSize = (): number => {
    // Default size for environment columns
    return 120;
};

export const useColumnSizing = (projectId: string, environments: string[]) => {
    const storageKey = `project-feature-toggles-column-sizes:${projectId}`;

    const [columnSizing, setColumnSizing] =
        useLocalStorageState<ColumnSizingState>(storageKey, {});

    const initialColumnSizing = useMemo(() => {
        const defaultSizes = { ...DEFAULT_COLUMN_SIZES };

        // Add environment column sizes
        environments.forEach((env) => {
            const envColumnId = `environment:${env}`;
            defaultSizes[envColumnId] = getEnvironmentColumnSize();
        });

        // Merge stored sizes with defaults
        return {
            ...defaultSizes,
            ...columnSizing,
        };
    }, [environments, columnSizing]);

    const onColumnSizingChange = (updater: any) => {
        const newSizing =
            typeof updater === 'function'
                ? updater(initialColumnSizing)
                : updater;
        setColumnSizing(newSizing);
    };

    const resetColumnSizing = () => {
        setColumnSizing({});
    };

    return {
        columnSizing: initialColumnSizing,
        onColumnSizingChange,
        resetColumnSizing,
    };
};
