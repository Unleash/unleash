import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HistoryItemDiff from './history-item-diff';
import HistoryItemJson from './history-item-json';
import { List, Switch, FormControlLabel } from '@material-ui/core';

import { formatFullDateTimeWithLocale } from '../common/util';

import styles from './history.module.scss';
import PageContent from '../common/PageContent/PageContent';
import HeaderTitle from '../common/HeaderTitle';

const getName = name => {
    if (name) {
        return (
            <React.Fragment>
                <dt>Name: </dt>
                <dd>{name}</dd>
            </React.Fragment>
        );
    } else {
        return null;
    }
};

const HistoryMeta = ({ entry, timeFormatted }) => (
    <div>
        <dl>
            <dt>Changed at:</dt>
            <dd>{timeFormatted}</dd>
            <dt>Changed by: </dt>
            <dd title={entry.createdBy}>{entry.createdBy}</dd>
            <dt>Type: </dt>
            <dd>{entry.type}</dd>
            {getName(entry.data.name)}
        </dl>
        <strong>Change</strong>
        <HistoryItemDiff entry={entry} />
    </div>
);
HistoryMeta.propTypes = {
    entry: PropTypes.object.isRequired,
    timeFormatted: PropTypes.string.isRequired,
};

class HistoryList extends Component {
    static propTypes = {
        title: PropTypes.string,
        history: PropTypes.array,
        settings: PropTypes.object,
        location: PropTypes.object,
        updateSetting: PropTypes.func.isRequired,
        hideName: PropTypes.bool,
    };

    toggleShowDiff() {
        this.props.updateSetting('showData', !this.props.settings.showData);
    }
    formatFulldateTime(v) {
        return formatFullDateTimeWithLocale(v, this.props.location.locale);
    }
    render() {
        const showData = this.props.settings.showData;
        const { history } = this.props;
        if (!history || history.length < 0) {
            return null;
        }

        let entries;

        const renderListItemCards = entry => (
            <div key={entry.id} className={styles.eventEntry}>
                <HistoryMeta entry={entry} timeFormatted={this.formatFulldateTime(entry.createdAt)} />
            </div>
        );

        if (showData) {
            entries = history.map(entry => <HistoryItemJson key={`log${entry.id}`} entry={entry} />);
        } else {
            entries = history.map(renderListItemCards);
        }

        return (
            <PageContent
                headerContent={
                    <HeaderTitle
                        title={this.props.title}
                        actions={
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={showData}
                                        onChange={this.toggleShowDiff.bind(this)}
                                        color="primary"
                                    />
                                }
                                label="Full events"
                            />
                        }
                    />
                }
            >
                <div className={styles.history}>
                    <List>{entries}</List>
                </div>
            </PageContent>
        );
    }
}
export default HistoryList;
