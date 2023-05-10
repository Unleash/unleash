import { Badge } from 'component/common/Badge/Badge';

interface IStatusChip {
    stale: boolean;
    showActive?: boolean;
}

export const FeatureStatusChip = ({
    stale,
    showActive = true,
}: IStatusChip) => {
    if (!stale && !showActive) {
        return null;
    }

    const title = stale
        ? 'Feature toggle is deprecated.'
        : 'Feature toggle is active.';
    const value = stale ? 'Stale' : 'Active';

    return (
        <div data-loading style={{ marginLeft: '8px' }}>
            <Badge color={stale ? 'error' : 'success'} title={title}>
                {value}
            </Badge>
        </div>
    );
};
