import { useCallback, useMemo, useState } from 'react';
import { styled } from '@mui/material';
import type { UserAccessRequestSchema } from 'openapi';
import { getLocalStorageItem, setLocalStorageItem } from 'utils/storage';
import { NotificationCard } from './NotificationCard';

const MAX_VISIBLE = 15;
const DEFAULT_STORAGE_KEY = 'unleash:access-requests:dismissed';

interface INotificationStackProps {
    accessRequests: UserAccessRequestSchema[];
    storageKey?: string;
    maxVisible?: number;
}

const StyledStack = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    width: theme.spacing(40),
    maxWidth: '100%',
    minWidth: theme.spacing(26),
}));

export const NotificationStack = ({
    accessRequests,
    storageKey = DEFAULT_STORAGE_KEY,
    maxVisible = MAX_VISIBLE,
}: INotificationStackProps) => {
    const [dismissedIds, setDismissedIds] = useState<string[]>(
        () => getLocalStorageItem<string[]>(storageKey) ?? [],
    );

    const dismiss = useCallback(
        (id: string) => {
            setDismissedIds((prev) => {
                if (prev.includes(id)) return prev;
                const next = [...prev, id];
                setLocalStorageItem(storageKey, next);
                return next;
            });
        },
        [storageKey],
    );

    const visibleRequests = useMemo(() => {
        const dismissed = new Set(dismissedIds);
        return [...accessRequests]
            .filter((request) => !dismissed.has(request.id))
            .sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1))
            .slice(0, maxVisible);
    }, [accessRequests, dismissedIds, maxVisible]);

    if (visibleRequests.length === 0) {
        return null;
    }

    return (
        <StyledStack
            aria-label='Access request notifications'
            aria-live='polite'
        >
            {visibleRequests.map((request) => (
                <NotificationCard
                    key={request.id}
                    request={request}
                    onDismiss={dismiss}
                />
            ))}
        </StyledStack>
    );
};
