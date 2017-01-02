import React, { PropTypes } from 'react';
import Feature from './feature-list-item-component';
import { Link } from 'react-router';
import { Icon, Chip, ChipContact, IconButton, FABButton, Textfield, Menu, MenuItem } from 'react-mdl';

import styles from './feature.scss';

export default class FeatureListComponent extends React.PureComponent {

    static propTypes () {
        return {
            onFeatureClick: PropTypes.func.isRequired,
            onFeatureRemove: PropTypes.func.isRequired,
            features: PropTypes.array.isRequired,
            featureMetrics: PropTypes.object.isRequired,
            fetchFeatureToggles: PropTypes.func.isRequired,
            fetchFeatureMetrics: PropTypes.func.isRequired,
        };
    }

    static contextTypes = {
        router: React.PropTypes.object,
    }

    componentDidMount () {
        this.props.fetchFeatureToggles();
        this.props.fetchFeatureMetrics();
        this.timer = setInterval(() => {
            this.props.fetchFeatureMetrics();
        }, 5000);
    }

    componentWillUnmount () {
        clearInterval(this.timer);
    }

    toggleMetrics () {
        this.props.updateSetting('showLastHour', !this.props.settings.showLastHour);
    }

    setFilter (v) {
        this.props.updateSetting('filter', typeof v === 'string' ? v : '');
    }

    setSort (v) {
        this.props.updateSetting('sort', typeof v === 'string' ? v.trim() : '');
    }

    render () {
        const { features, onFeatureClick, onFeatureRemove, featureMetrics, settings } = this.props;

        return (
           <div>
                <div className={styles.topList}>
                    <Chip onClick={() => this.toggleMetrics()} className={styles.topListItem0}>
                        { settings.showLastHour &&
                            <ChipContact className="mdl-color--teal mdl-color-text--white">
                                <Icon name="hourglass_full" style={{ fontSize: '16px' }} />
                            </ChipContact> }
                        { '1 hour' }
                    </Chip>
                    &nbsp;
                    <Chip onClick={() => this.toggleMetrics()} className={styles.topListItem0}>
                        { !settings.showLastHour &&
                            <ChipContact className="mdl-color--teal mdl-color-text--white">
                                <Icon name="hourglass_empty" style={{ fontSize: '16px' }} />
                            </ChipContact> }
                        { '1 minute' }
                    </Chip>

                    <div className={styles.topListItem2} style={{ margin: '-10px 10px 0 10px'  }}>
                        <Textfield
                            floatingLabel
                            value={settings.filter}
                            onChange={(e) => { this.setFilter(e.target.value); }}
                            label="Filter toggles"
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div style={{ position: 'relative' }} className={styles.topListItem0}>
                        <IconButton name="sort" id="demo-menu-top-right" colored title="Sort" />
                        <Menu target="demo-menu-top-right" valign="bottom" align="right" ripple onClick={
                            (e) => this.setSort(e.target.getAttribute('data-target'))}>
                            <MenuItem disabled>Filter by:</MenuItem>
                            <MenuItem disabled={!settings.sort || settings.sort === 'nosort'} data-target="nosort">Default</MenuItem>
                            <MenuItem disabled={settings.sort === 'name'} data-target="name">Name</MenuItem>
                            <MenuItem disabled={settings.sort === 'enabled'} data-target="enabled">Enabled</MenuItem>
                            <MenuItem disabled={settings.sort === 'appName'} data-target="appName">Application name</MenuItem>
                            <MenuItem disabled={settings.sort === 'created'} data-target="created">Created</MenuItem>
                            <MenuItem disabled={settings.sort === 'strategies'} data-target="strategies">Strategies</MenuItem>
                            <MenuItem disabled={settings.sort === 'metrics'} data-target="metrics">Metrics</MenuItem>
                        </Menu>
                    </div>
                    <Link to="/features/create" className={styles.topListItem0}>
                        <IconButton ripple raised name="add" component="span" style={{ color: 'black' }}/>
                    </Link>
                </div>

                <ul className="mdl-list">
                    {features.map((feature, i) =>
                        <Feature key={i}
                            settings={settings}
                            metricsLastHour={featureMetrics.lastHour[feature.name]}
                            metricsLastMinute={featureMetrics.lastMinute[feature.name]}
                            feature={feature}
                            onFeatureClick={onFeatureClick}
                            onFeatureRemove={onFeatureRemove}/>
                    )}
                </ul>
                <hr />
                <Link to="/features/create" className={styles.topListItem0}>
                    <FABButton ripple component="span" mini>
                        <Icon name="add" />
                    </FABButton>
                </Link>
           </div>
        );
    }
}
