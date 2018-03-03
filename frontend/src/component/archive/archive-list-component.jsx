import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import Feature from './../feature/feature-list-item-component';
import { Icon, Card, List, ListItem, ListItemContent, ListItemAction, Chip } from 'react-mdl';
//import { Textfield, Menu, MenuItem, Card, CardActions, List, Chip, MenuItemWithIcon, DropdownButton } from 'react-mdl';
import { styles as commonStyles } from '../common';
import styles from './archive.scss';

class ArchiveList extends React.PureComponent {
    static propTypes = {
        name: PropTypes.string,
        archive: PropTypes.array.isRequired,
        fetchArchive: PropTypes.func,
        featureMetrics: PropTypes.object.isRequired,
        updateSetting: PropTypes.func.isRequired,
        settings: PropTypes.object,
        revive: PropTypes.func.optional,
    };

    componentDidMount() {
        this.props.fetchArchive();
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

    // render() {
    //     const { archive, featureMetrics, settings, revive } = this.props;
    //     archive.forEach(e => {
    //         e.reviveName = e.name;
    //     });
    //     return (
    //         <div>
    //             <div className={styles.toolbar}>
    //                 <Textfield
    //                     floatingLabel
    //                     value={settings.filter}
    //                     onChange={e => {
    //                         this.setFilter(e.target.value);
    //                     }}
    //                     label="Search"
    //                     style={{ width: '100%' }}
    //                 />
    //             </div>
    //             <Card shadow={0} className={commonStyles.fullwidth} style={{ overflow: 'visible' }}>
    //                 <CardActions>
    //                     <DropdownButton id="metric" label={`Last ${settings.showLastHour ? 'hour' : 'minute'}`} />
    //                     <Menu target="metric" onClick={() => this.toggleMetrics()} style={{ width: '168px' }}>
    //                         <MenuItemWithIcon
    //                             icon="hourglass_empty"
    //                             disabled={!settings.showLastHour}
    //                             data-target="minute"
    //                             label="Last minute"
    //                         />
    //                         <MenuItemWithIcon
    //                             icon="hourglass_full"
    //                             disabled={settings.showLastHour}
    //                             data-target="hour"
    //                             label="Last hour"
    //                         />
    //                     </Menu>
    //                     <DropdownButton id="sorting" label={`By ${settings.sort}`} />
    //                     <Menu
    //                         target="sorting"
    //                         onClick={e => this.setSort(e.target.getAttribute('data-target'))}
    //                         style={{ width: '168px' }}
    //                     >
    //                         <MenuItem disabled={settings.sort === 'name'} data-target="name">
    //                             Name
    //                         </MenuItem>
    //                         <MenuItem disabled={settings.sort === 'enabled'} data-target="enabled">
    //                             Enabled
    //                         </MenuItem>
    //                         <MenuItem disabled={settings.sort === 'created'} data-target="created">
    //                             Created
    //                         </MenuItem>
    //                         <MenuItem disabled={settings.sort === 'strategies'} data-target="strategies">
    //                             Strategies
    //                         </MenuItem>
    //                         <MenuItem disabled={settings.sort === 'metrics'} data-target="metrics">
    //                             Metrics
    //                         </MenuItem>
    //                     </Menu>
    //                 </CardActions>
    //                 <hr />
    //                 <List>
    //                     {archive.map((feature, i) => (
    //                         <Feature
    //                             key={i}
    //                             settings={settings}
    //                             metricsLastHour={featureMetrics.lastHour[feature.name]}
    //                             metricsLastMinute={featureMetrics.lastMinute[feature.name]}
    //                             feature={feature}
    //                             revive={revive}
    //                         />
    //                     ))}
    //                 </List>
    //             </Card>
    //         </div>
    //     );
    // }

    render() {
        const { archive, featureMetrics, settings, revive } = this.props;

        archive.forEach(e => {
            e.reviveName = e.name;
        });
        return (
            <Card shadow={0} className={commonStyles.fullwidth}>
                {archive && archive.length > 0 ? (
                    <div>
                        <div style={{ position: 'relative' }}>
                            <List>
                                <ListItem className={styles.archiveList}>
                                    <span className={styles.listItemToggle}>Toggle name</span>
                                    <span className={styles.listItemRevive}>Revive</span>
                                </ListItem>
                                <hr />
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
                            </List>
                        </div>
                    </div>
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
