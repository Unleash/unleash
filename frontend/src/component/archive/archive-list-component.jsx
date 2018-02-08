import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Icon, Card, List, ListItem, ListItemContent, ListItemAction } from 'react-mdl';
import { styles as commonStyles } from '../common';
import styles from './archive.scss';

class ArchiveList extends Component {
    static propTypes = {
        name: PropTypes.string,
        archive: PropTypes.array,
        fetchArchive: PropTypes.func,
        revive: PropTypes.func,
    };
    flag = this.props.name;
    componentDidMount() {
        this.props.fetchArchive();
        this.props.archive.map(f => (f.displayDetail = false));
    }
    renderStrategies(feature) {
        let cumul = feature.strategies.reduce((total, f) => {
            // todo: do we want to display paramters
            total += `${f.name} `;
            return total;
        }, '');
        return cumul;
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
                                                        {feature.name}
                                                        <div className={styles.toggleDetails}>
                                                            {feature.description}
                                                        </div>
                                                        <div className={styles.toggleDetails}>
                                                            Strategy: {this.renderStrategies(feature)}
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
                                                        <div className={styles.toggleDetails}>
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
