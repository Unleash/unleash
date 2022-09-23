import { diff } from 'deep-diff';
import { IEvent } from 'interfaces/event';
import { useTheme } from '@mui/system';
import { CSSProperties } from 'react';

const DIFF_PREFIXES: Record<string, string> = {
    A: ' ',
    E: ' ',
    D: '-',
    N: '+',
};

interface IEventDiffProps {
    entry: Partial<IEvent>;
}

const EventDiff = ({ entry }: IEventDiffProps) => {
    const theme = useTheme();

    const styles: Record<string, CSSProperties> = {
        A: { color: theme.palette.code.edited }, // array edited
        E: { color: theme.palette.code.edited }, // edited
        D: { color: theme.palette.code.diffSub }, // deleted
        N: { color: theme.palette.code.diffAdd }, // added
    };

    const diffs =
        entry.data && entry.preData
            ? diff(entry.preData, entry.data)
            : undefined;

    const buildItemDiff = (diff: any, key: string) => {
        let change;
        if (diff.lhs !== undefined) {
            change = (
                <div style={styles.D}>
                    - {key}: {JSON.stringify(diff.lhs)}
                </div>
            );
        } else if (diff.rhs !== undefined) {
            change = (
                <div style={styles.N}>
                    + {key}: {JSON.stringify(diff.rhs)}
                </div>
            );
        }

        return change;
    };

    const buildDiff = (diff: any, idx: number) => {
        let change;
        const key = diff.path.join('.');

        if (diff.item) {
            change = buildItemDiff(diff.item, key);
        } else if (diff.lhs !== undefined && diff.rhs !== undefined) {
            change = (
                <div>
                    <div style={styles.D}>
                        - {key}: {JSON.stringify(diff.lhs)}
                    </div>
                    <div style={styles.N}>
                        + {key}: {JSON.stringify(diff.rhs)}
                    </div>
                </div>
            );
        } else {
            change = (
                <div style={styles[diff.kind]}>
                    {DIFF_PREFIXES[diff.kind]} {key}:{' '}
                    {JSON.stringify(diff.rhs || diff.item)}
                </div>
            );
        }

        return <div key={idx}>{change}</div>;
    };

    let changes;

    if (diffs) {
        changes = diffs.map(buildDiff);
    } else {
        // Just show the data if there is no diff yet.
        const data = entry.data || entry.preData;
        changes = [
            <div style={entry.data ? styles.N : styles.D}>
                {JSON.stringify(data, null, 2)}
            </div>,
        ];
    }

    return (
        <pre style={{ overflowX: 'auto', overflowY: 'hidden' }} tabIndex={0}>
            <code>{changes.length === 0 ? '(no changes)' : changes}</code>
        </pre>
    );
};

export default EventDiff;
