import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import Feature from './../feature/feature-list-item-component';
import { CardActions, Menu, MenuItem, Icon, Card, List, Chip } from 'react-mdl';
import { MenuItemWithIcon, DropdownButton, styles as commonStyles } from '../common';
import styles from './archive.scss';

class ArchiveList extends React.PureComponent {
    static propTypes = {
        name: PropTypes.string,
        archive: PropTypes.array.isRequired,
        fetchArchive: PropTypes.func,
        featureMetrics: PropTypes.object,
        updateSetting: PropTypes.func,
        settings: PropTypes.object,
        revive: PropTypes.func,
    };

    componentDidMount() {
        this.props.fetchArchive();
    }
    setSort(v) {
        this.props.updateSetting('sort', typeof v === 'string' ? v.trim() : '');
    }
    toggleMetrics() {
        this.props.updateSetting('showLastHour', !this.props.settings.showLastHour);
    }
    renderStrategyDetail(feature) {
        let strategiesList = (
            <span>
                {feature.strategies.map((s, i) => (
                    <span style={{ marginLeft: `8px` }} key={i}>
                        <strong>{s.name}</strong>
                        {Object.keys(s.parameters).map((p, j) => <i key={j}> {s.parameters[p]}</i>)}
                    </span>
                ))}
            </span>
        );

        return strategiesList;
    }
    renderStrategiesInList(feature) {
        let display = [];
        if (feature.strategies && feature.strategies.length > 0) {
            const strategiesToShow = Math.min(feature.strategies.length, 3);
            const remainingStrategies = feature.strategies.length - strategiesToShow;

            const strategyChips =
                feature.strategies &&
                feature.strategies.slice(0, strategiesToShow).map((s, i) => (
                    <span key={i} className={[styles.strategiesList, commonStyles.hideLt920].join(' ')}>
                        <Chip className={styles.strategyChip}>{s.name}</Chip>
                    </span>
                ));
            const remaining = (
                <span className={[styles.strategiesList, commonStyles.hideLt920].join(' ')}>
                    <Chip className={styles.strategyChip}>+{remainingStrategies}</Chip>
                </span>
            );
            if (remainingStrategies > 0) {
                display.push(remaining);
            }
            display.push(strategyChips);
        }
        return display;
    }

    render() {
        const { archive, featureMetrics, settings, revive } = this.props;

        archive.forEach(e => {
            e.reviveName = e.name;
        });
        return (
            <Card shadow={0} className={commonStyles.fullwidth}>
                <CardActions>
                    <DropdownButton id="metric" label={`Last ${settings.showLastHour ? 'hour' : 'minute'}`} />
                    <Menu target="metric" onClick={() => this.toggleMetrics()} style={{ width: '168px' }}>
                        <MenuItemWithIcon
                            icon="hourglass_empty"
                            disabled={!settings.showLastHour}
                            data-target="minute"
                            label="Last minute"
                        />
                        <MenuItemWithIcon
                            icon="hourglass_full"
                            disabled={settings.showLastHour}
                            data-target="hour"
                            label="Last hour"
                        />
                    </Menu>
                    <DropdownButton id="sorting" label={`By ${settings.sort}`} />
                    <Menu
                        target="sorting"
                        onClick={e => this.setSort(e.target.getAttribute('data-target'))}
                        style={{ width: '168px' }}
                    >
                        <MenuItem disabled={settings.sort === 'name'} data-target="name">
                            Name
                        </MenuItem>
                        <MenuItem disabled={settings.sort === 'enabled'} data-target="enabled">
                            Enabled
                        </MenuItem>
                        <MenuItem disabled={settings.sort === 'created'} data-target="created">
                            Created
                        </MenuItem>
                        <MenuItem disabled={settings.sort === 'strategies'} data-target="strategies">
                            Strategies
                        </MenuItem>
                        <MenuItem disabled={settings.sort === 'metrics'} data-target="metrics">
                            Metrics
                        </MenuItem>
                    </Menu>
                </CardActions>
                <hr />
                {archive && archive.length > 0 ? (
                    <List>
                        {archive.map((feature, i) => (
                            <Feature
                                key={i}
                                settings={settings}
                                metricsLastHour={featureMetrics.lastHour[feature.name]}
                                metricsLastMinute={featureMetrics.lastMinute[feature.name]}
                                feature={feature}
                                revive={revive}
                            />
                        ))}
                    </List>
                ) : (
                    <div className={commonStyles.emptyState}>
                        <Icon name="archive" className="mdl-color-text--grey-300" style={{ fontSize: '56px' }} />
                        <br />
                        No archived feature toggles, go see <Link to="/features">active toggles here</Link>
                    </div>
                )}
            </Card>
        );
    }
}

export default ArchiveList;
