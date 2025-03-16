import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IconButton, Tooltip } from '@mui/material';
import { useCollapsedStrategies } from 'component/feature/FeatureView/FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/CollapseStrategyIcon/hooks/useCollapsedStrategies';
import type { IFeatureStrategyPayload } from 'interfaces/strategy';
import { type VFC } from 'react';
import { STRATEGY_FORM_COPY_ID } from 'utils/testIds';
import { useIsCollapsed } from './hooks/useIsCollapsed';

interface ICollapseStrategyIconProps {
    strategy: IFeatureStrategyPayload;
}

export const CollapseStrategyIcon: VFC<ICollapseStrategyIconProps> = ({
    strategy,
}) => {
    const { collapseStrategy, expandStrategy } = useCollapsedStrategies();

    const collapsed = useIsCollapsed(strategy.id);

    const label = collapsed ? 'Expand Strategy' : 'Collapse Strategy';

    const onClick = () => {
        if (!strategy.id) return
        if (collapsed) {
            expandStrategy(strategy.id);
        } else {
            collapseStrategy(strategy.id);
        }
    }

    if (!strategy.id) {
        return null;
    }

    return (
        <div>
            <Tooltip title={label}>
                <div>
                    <IconButton
                        size='large'
                        id={`copy-strategy-icon-menu-${strategy.id}`}
                        aria-label={label}
                        aria-haspopup='true'
                        aria-expanded={collapsed ? undefined : 'true'}
                        onClick={onClick}
                        data-testid={STRATEGY_FORM_COPY_ID}
                    >
                        {collapsed
                            ? <ExpandMoreIcon/>
                            : <ExpandLessIcon />
                        }
                    </IconButton>
                </div>
            </Tooltip>
        </div>
    )
}
