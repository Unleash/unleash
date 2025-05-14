import { useLocalStorageState } from 'hooks/useLocalStorageState';
import type { NavigationMode } from './NavigationMode.jsx';
import { useEffect } from 'react';

export const useNavigationMode = () => {
    const [mode, setMode] = useLocalStorageState<NavigationMode>(
        'navigation-mode:v1',
        'full',
    );
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'b' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                setMode(mode === 'mini' ? 'full' : 'mini');
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [mode]);

    return [mode, setMode] as const;
};
