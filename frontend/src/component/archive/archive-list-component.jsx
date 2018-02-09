import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Icon, Card, List, ListItem, ListItemContent, ListItemAction, Chip } from 'react-mdl';
import { styles as commonStyles } from '../common';
import styles from './archive.scss';

class ArchiveList extends Component {
    static propTypes = {
        name: PropTypes.string,
        archive: PropTypes.array,
        fetchArchive: PropTypes.func,
        revive: PropTypes.func,
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
                        {Object.keys(s.parameters).map((p, j) => (
                            <i key={j}> {s.parameters[p]}</i>
                        ))}
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
        const { archive, revive } = this.props;
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
                                        <ListItem key={i} twoLine>
                                            <ListItemAction>
                                                {this.props.name && feature.name === this.props.name ? (
                                                    <Icon name="keyboard_arrow_down" />
                                                ) : (
                                                    <Icon name="keyboard_arrow_right" />
                                                )}
                                            </ListItemAction>
                                            <ListItemContent>
                                                {this.props.name && feature.name === this.props.name ? (
                                                    <Link
                                                        to={`/archive`}
                                                        className={[commonStyles.listLink, commonStyles.truncate].join(
                                                            ' '
                                                        )}
                                                    >
                                                        {this.renderStrategiesInList(feature).map((strategyChip, i) => (
                                                            <span key={i}>{strategyChip}</span>
                                                        ))}

                                                        {feature.name}
                                                        <div className={'mdl-list__item-sub-title'}>
                                                            {feature.description}
                                                        </div>
                                                        <div className={'mdl-list__item-sub-title'}>
                                                            {this.renderStrategyDetail(feature)}
                                                        </div>
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        to={`/archive/${feature.name}`}
                                                        className={[commonStyles.listLink, commonStyles.truncate].join(
                                                            ' '
                                                        )}
                                                    >
                                                        {feature.name}

                                                        {this.renderStrategiesInList(feature).map((strategyChip, i) => (
                                                            <span key={i}>{strategyChip}</span>
                                                        ))}

                                                        <div className={'mdl-list__item-sub-title'}>
                                                            {feature.description}
                                                        </div>
                                                    </Link>
                                                )}
                                            </ListItemContent>
                                            <ListItemAction onClick={() => revive(feature.name)}>
                                                <Icon name="undo" />
                                            </ListItemAction>
                                        </ListItem>
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
