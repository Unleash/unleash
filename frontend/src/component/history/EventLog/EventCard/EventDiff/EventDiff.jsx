import PropTypes from 'prop-types';

import { useStyles } from './EventDiff.styles';

const DIFF_PREFIXES = {
    A: ' ',
    E: ' ',
    D: '-',
    N: '+',
};

const EventDiff = ({ entry }) => {
    const styles = useStyles();

    const KLASSES = {
        A: styles.blue, // array edited
        E: styles.blue, // edited
        D: styles.negative, // deleted
        N: styles.positive, // added
    };

    const buildItemDiff = (diff, key) => {
        let change;
        if (diff.lhs !== undefined) {
            change = (
                <div>
                    <div className={KLASSES.D}>
                        - {key}: {JSON.stringify(diff.lhs)}
                    </div>
                </div>
            );
        } else if (diff.rhs !== undefined) {
            change = (
                <div>
                    <div className={KLASSES.N}>
                        + {key}: {JSON.stringify(diff.rhs)}
                    </div>
                </div>
            );
        }

        return change;
    };

    const buildDiff = (diff, idx) => {
        let change;
        const key = diff.path.join('.');

        if (diff.item) {
            change = buildItemDiff(diff.item, key);
        } else if (diff.lhs !== undefined && diff.rhs !== undefined) {
            change = (
                <div>
                    <div className={KLASSES.D}>
                        - {key}: {JSON.stringify(diff.lhs)}
                    </div>
                    <div className={KLASSES.N}>
                        + {key}: {JSON.stringify(diff.rhs)}
                    </div>
                </div>
            );
        } else {
            const spadenClass = KLASSES[diff.kind];
            const prefix = DIFF_PREFIXES[diff.kind];

            change = (
                <div className={spadenClass}>
                    {prefix} {key}: {JSON.stringify(diff.rhs || diff.item)}
                </div>
            );
        }

        return <div key={idx}>{change}</div>;
    };

    let changes;

    if (entry.diffs) {
        changes = entry.diffs.map(buildDiff);
    } else {
        // Just show the data if there is no diff yet.
        changes = (
            <div className={KLASSES.N}>
                {JSON.stringify(entry.data, null, 2)}
            </div>
        );
    }

    return (
        <pre style={{ overflowX: 'auto', overflowY: 'hidden' }}>
            <code className="smalltext man">
                {changes.length === 0 ? '(no changes)' : changes}
            </code>
        </pre>
    );
};

EventDiff.propTypes = {
    entry: PropTypes.object,
};

export default EventDiff;
