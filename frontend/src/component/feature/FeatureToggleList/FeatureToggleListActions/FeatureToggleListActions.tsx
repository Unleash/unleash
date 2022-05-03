import { Dispatch, MouseEventHandler, SetStateAction, VFC } from 'react';
import { MenuItem, Typography } from '@mui/material';
import DropdownMenu from 'component/common/DropdownMenu/DropdownMenu';
import ProjectSelect from 'component/common/ProjectSelect/ProjectSelect';
import useLoading from 'hooks/useLoading';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    createFeaturesFilterSortOptions,
    FeaturesSortType,
    IFeaturesSort,
} from 'hooks/useFeaturesSort';
import { useStyles } from './styles';
import { IFeaturesFilter } from 'hooks/useFeaturesFilter';

let sortOptions = createFeaturesFilterSortOptions();

interface IFeatureToggleListActionsProps {
    filter: IFeaturesFilter;
    setFilter: Dispatch<SetStateAction<IFeaturesFilter>>;
    sort: IFeaturesSort;
    setSort: Dispatch<SetStateAction<IFeaturesSort>>;
    loading?: boolean;
    inProject?: boolean;
}

export const FeatureToggleListActions: VFC<IFeatureToggleListActionsProps> = ({
    filter,
    setFilter,
    sort,
    setSort,
    loading = false,
    inProject,
}) => {
    const { classes: styles } = useStyles();
    const { uiConfig } = useUiConfig();
    const ref = useLoading(loading);

    const handleSort: MouseEventHandler = e => {
        const type = (e.target as Element)
            .getAttribute('data-target')
            ?.trim() as FeaturesSortType;
        if (type) {
            setSort(prev => ({ ...prev, type }));
        }
    };

    const selectedOption =
        sortOptions.find(o => o.type === sort.type) || sortOptions[0];

    if (inProject) {
        sortOptions = sortOptions.filter(option => option.type !== 'project');
    }

    const renderSortingOptions = () =>
        sortOptions.map(option => (
            <MenuItem
                style={{ fontSize: '14px' }}
                key={option.type}
                disabled={option.type === sort.type}
                data-target={option.type}
            >
                {option.name}
            </MenuItem>
        ));

    return (
        <div className={styles.actions} ref={ref}>
            <Typography variant="body2" data-loading>
                Sorted by:
            </Typography>
            <DropdownMenu
                id={'sorting'}
                label={`By ${selectedOption.name}`}
                callback={handleSort}
                renderOptions={renderSortingOptions}
                title="Sort by"
                style={{ textTransform: 'lowercase', fontWeight: 'normal' }}
                data-loading
            />
            <ConditionallyRender
                condition={uiConfig.flags.P && !inProject}
                show={
                    <ProjectSelect
                        currentProjectId={filter.project}
                        updateCurrentProject={project =>
                            setFilter(prev => ({ ...prev, project }))
                        }
                        style={{
                            textTransform: 'lowercase',
                            fontWeight: 'normal',
                        }}
                        data-loading
                    />
                }
            />
        </div>
    );
};
