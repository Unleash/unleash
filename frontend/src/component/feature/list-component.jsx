import React from 'react';
import PropTypes from 'prop-types';
import Feature from './feature-list-item-component';
import { hashHistory, Link } from 'react-router';
import { Icon, FABButton, Textfield, Menu, MenuItem, Card, CardActions, List } from 'react-mdl';
import { MenuItemWithIcon, DropdownButton, styles as commonStyles } from '../common';
import styles from './feature.scss';

export default class FeatureListComponent extends React.Component {
    static propTypes = {
        features: PropTypes.array.isRequired,
        featureMetrics: PropTypes.object.isRequired,
        fetchFeatureToggles: PropTypes.func,
        fetchArchive: PropTypes.func,
        logoutUser: PropTypes.func,
        revive: PropTypes.func,
        updateSetting: PropTypes.func.isRequired,
        toggleFeature: PropTypes.func,
        settings: PropTypes.object,
    };

    static contextTypes = {
        router: PropTypes.object,
    };

    componentDidMount() {
        if (this.props.logout) {
            this.props.logoutUser();
            hashHistory.push(`/`);
        }
        if (this.props.fetchFeatureToggles) {
            this.props.fetchFeatureToggles();
        } else {
            this.props.fetchArchive();
        }
    }

    toggleMetrics() {
        this.props.updateSetting('showLastHour', !this.props.settings.showLastHour);
    }

    setFilter(v) {
        this.props.updateSetting('filter', typeof v === 'string' ? v : '');
    }

    setSort(v) {
        this.props.updateSetting('sort', typeof v === 'string' ? v.trim() : '');
    }

    render() {
        const { features, toggleFeature, featureMetrics, settings, revive } = this.props;
        features.forEach(e => {
            e.reviveName = e.name;
        });
        return (
            <div>
                <div className={styles.toolbar}>
                    <Textfield
                        floatingLabel
                        value={settings.filter}
                        onChange={e => {
                            this.setFilter(e.target.value);
                        }}
                        label="Search"
                        style={{ width: '100%' }}
                    />
                    <Link to="/features/create" className={styles.toolbarButton}>
                        <FABButton accent title="Create feature toggle">
                            <Icon name="add" />
                        </FABButton>
                    </Link>
                </div>
                <Card shadow={0} className={commonStyles.fullwidth} style={{ overflow: 'visible' }}>
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
                    <List>
                        {features.map((feature, i) => (
                            <Feature
                                key={i}
                                settings={settings}
                                metricsLastHour={featureMetrics.lastHour[feature.name]}
                                metricsLastMinute={featureMetrics.lastMinute[feature.name]}
                                feature={feature}
                                toggleFeature={toggleFeature}
                                revive={revive}
                            />
                        ))}
                    </List>
                </Card>
            </div>
        );
    }
}
