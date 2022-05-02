import { useState, useEffect, VFC } from 'react';
import { Paper, MenuItem } from '@material-ui/core';
import { useFeaturesSort } from 'hooks/useFeaturesSort';
import { IFeatureToggleListItem } from 'interfaces/featureToggle';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import DropdownMenu from 'component/common/DropdownMenu/DropdownMenu';
import {
    getObjectProperties,
    getCheckedState,
    applyCheckedToFeatures,
} from '../utils';
import { ReportToggleListItem } from './ReportToggleListItem/ReportToggleListItem';
import { ReportToggleListHeader } from './ReportToggleListHeader/ReportToggleListHeader';
import { useStyles } from './ReportToggleList.styles';

/* FLAG TO TOGGLE UNFINISHED BULK ACTIONS FEATURE */
const BULK_ACTIONS_ON = false;

interface IReportToggleListProps {
    selectedProject: string;
    features: IFeatureToggleListItem[];
}

export const ReportToggleList: VFC<IReportToggleListProps> = ({
    features,
    selectedProject,
}) => {
    const styles = useStyles();
    const [checkAll, setCheckAll] = useState(false);
    const [localFeatures, setFeatures] = useState<IFeatureToggleListItem[]>([]);
    // @ts-expect-error
    const { setSort, sorted } = useFeaturesSort(localFeatures);

    useEffect(() => {
        const formattedFeatures = features.map(feature => ({
            ...getObjectProperties(
                feature,
                'name',
                'lastSeenAt',
                'createdAt',
                'stale',
                'type'
            ),
            // @ts-expect-error
            checked: getCheckedState(feature.name, features),
            setFeatures,
        }));

        // @ts-expect-error
        setFeatures(formattedFeatures);
    }, [features, selectedProject]);

    const handleCheckAll = () => {
        if (!checkAll) {
            setCheckAll(true);
            return setFeatures(prev => applyCheckedToFeatures(prev, true));
        }
        setCheckAll(false);
        return setFeatures(prev => applyCheckedToFeatures(prev, false));
    };

    const renderListRows = () =>
        sorted.map(feature => (
            // @ts-expect-error
            <ReportToggleListItem
                key={feature.name}
                {...feature}
                project={selectedProject}
                bulkActionsOn={BULK_ACTIONS_ON}
            />
        ));

    const renderBulkActionsMenu = () => (
        <DropdownMenu
            id="bulk-actions"
            label="Bulk actions"
            renderOptions={() => (
                <>
                    <MenuItem>Mark toggles as stale</MenuItem>
                    <MenuItem>Delete toggles</MenuItem>
                </>
            )}
        />
    );

    return (
        <Paper className={styles.reportToggleList}>
            <div className={styles.reportToggleListHeader}>
                <h3 className={styles.reportToggleListHeading}>Overview</h3>
                <ConditionallyRender
                    condition={BULK_ACTIONS_ON}
                    show={renderBulkActionsMenu}
                />
            </div>
            <div className={styles.reportToggleListInnerContainer}>
                <table className={styles.reportingToggleTable}>
                    <ReportToggleListHeader
                        handleCheckAll={handleCheckAll}
                        checkAll={checkAll}
                        // @ts-expect-error
                        setSort={setSort}
                        bulkActionsOn={BULK_ACTIONS_ON}
                    />

                    <tbody>{renderListRows()}</tbody>
                </table>
            </div>
        </Paper>
    );
};
