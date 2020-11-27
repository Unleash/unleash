import React from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'debounce';
import { Link } from 'react-router-dom';
import { Icon, FABButton, Menu, MenuItem, Card, CardActions, List } from 'react-mdl';
import Feature from './list-item-component';
import { MenuItemWithIcon, DropdownButton, styles as commonStyles } from '../../common';
import SearchField from '../../common/search-field';
import { CREATE_FEATURE } from '../../../permissions';
import ProjectMenu from './project-container';

export default class FeatureListComponent extends React.Component {
    static propTypes = {
        features: PropTypes.array.isRequired,
        featureMetrics: PropTypes.object.isRequired,
        fetchFeatureToggles: PropTypes.func,
        fetchArchive: PropTypes.func,
        revive: PropTypes.func,
        updateSetting: PropTypes.func.isRequired,
        toggleFeature: PropTypes.func,
        settings: PropTypes.object,
        history: PropTypes.object.isRequired,
        hasPermission: PropTypes.func.isRequired,
    };

    constructor(props) {
        super();
        this.state = {
            filter: props.settings.filter,
            updateFilter: debounce(props.updateSetting.bind(this, 'filter'), 150),
        };
    }

    componentDidMount() {
        if (this.props.fetchFeatureToggles) {
            this.props.fetchFeatureToggles();
        } else {
            this.props.fetchArchive();
        }
    }

    toggleMetrics() {
        this.props.updateSetting('showLastHour', !this.props.settings.showLastHour);
    }

    setFilter = v => {
        const value = typeof v === 'string' ? v : '';
        this.setState({ filter: value });
        this.state.updateFilter(value);
    };

    setSort(v) {
        this.props.updateSetting('sort', typeof v === 'string' ? v.trim() : '');
    }

    render() {
        const { features, toggleFeature, featureMetrics, settings, revive, hasPermission } = this.props;
        features.forEach(e => {
            e.reviveName = e.name;
        });
        return (
            <div>
                <div className={commonStyles.toolbar}>
                    <SearchField
                        value={this.props.settings.filter}
                        updateValue={this.props.updateSetting.bind(this, 'filter')}
                    />
                    {hasPermission(CREATE_FEATURE) ? (
                        <Link to="/features/create" className={commonStyles.toolbarButton}>
                            <FABButton accent title="Create feature toggle">
                                <Icon name="add" />
                            </FABButton>
                        </Link>
                    ) : (
                        ''
                    )}
                </div>
                <Card shadow={0} className={commonStyles.fullwidth} style={{ overflow: 'visible' }}>
                    <CardActions>
                        <DropdownButton
                            id="metric"
                            label={`Last ${settings.showLastHour ? 'hour' : 'minute'}`}
                            title="Metric interval"
                        />
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
                        <DropdownButton id="sorting" label={`By ${settings.sort}`} title="Sort by" />
                        <Menu
                            target="sorting"
                            onClick={e => this.setSort(e.target.getAttribute('data-target'))}
                            style={{ width: '168px' }}
                        >
                            <MenuItem disabled={settings.sort === 'name'} data-target="name">
                                Name
                            </MenuItem>
                            <MenuItem disabled={settings.sort === 'type'} data-target="type">
                                Type
                            </MenuItem>
                            <MenuItem disabled={settings.sort === 'enabled'} data-target="enabled">
                                Enabled
                            </MenuItem>
                            <MenuItem disabled={settings.sort === 'stale'} data-target="stale">
                                Stale
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
                        <ProjectMenu settings={this.props.settings} updateSetting={this.props.updateSetting} />
                    </CardActions>
                    <hr />
                    <List>
                        {features.length > 0 ? (
                            features.map((feature, i) => (
                                <Feature
                                    key={i}
                                    settings={settings}
                                    metricsLastHour={featureMetrics.lastHour[feature.name]}
                                    metricsLastMinute={featureMetrics.lastMinute[feature.name]}
                                    feature={feature}
                                    toggleFeature={toggleFeature}
                                    revive={revive}
                                    hasPermission={hasPermission}
                                    setFilter={this.setFilter}
                                />
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', marginTop: '50px', color: 'gray' }}>
                                Empty list of feature toggles
                            </p>
                        )}
                    </List>
                </Card>
            </div>
        );
    }
}
