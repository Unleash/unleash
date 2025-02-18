import { Badge } from 'component/common/Badge/Badge';

interface IStatusChip {
    stale: boolean;
    showActive?: boolean;
    withLeftMargin?: boolean;
}

export const FeatureStatusChip = ({
    stale,
    showActive = true,
    withLeftMargin = true,
}: IStatusChip) => {
    if (!stale && !showActive) {
        return null;
    }

    const title = stale
        ? 'Feature flag is deprecated.'
        : 'Feature flag is active.';
    const value = stale ? 'Stale' : 'Active';

    return (
        <div data-loading style={{ marginLeft: withLeftMargin ? '8px' : 0 }}>
            <Badge color={stale ? 'error' : 'success'} title={title}>
                {value}
            </Badge>
        </div>
    );
};
