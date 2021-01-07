import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HistoryItemDiff from './history-item-diff';
import HistoryItemJson from './history-item-json';
import { Table, TableHeader } from 'react-mdl';
import { DataTableHeader, SwitchWithLabel, styles as commonStyles } from '../common';
import { formatFullDateTimeWithLocale } from '../common/util';

import styles from './history.module.scss';

const HistoryMeta = ({ entry, timeFormatted }) => (
    <div>
        <dl>
            <dt>Changed at:</dt>
            <dd>{timeFormatted}</dd>
            <dt>Changed by: </dt>
            <dd title={entry.createdBy}>{entry.createdBy}</dd>
            <dt>Type: </dt>
            <dd>{entry.type}</dd>
            <dt>Name: </dt>
            <dd>{entry.data.name}</dd>
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

        const truncateTableCell = v => (
            <span
                className={commonStyles.truncate}
                style={{ display: 'inline-block', verticalAlign: 'middle', width: '100%' }}
            >
                {v}
            </span>
        );

        let entries;

        if (showData) {
            entries = history.map(entry => <HistoryItemJson key={`log${entry.id}`} entry={entry} />);
        } else {
            entries = (
                <Table
                    rows={history.map(entry =>
                        Object.assign(
                            {
                                meta: (
                                    <HistoryMeta
                                        entry={entry}
                                        timeFormatted={this.formatFulldateTime(entry.createdAt)}
                                    />
                                ),
                            },
                            entry
                        )
                    )}
                    className={commonStyles.fullwidth}
                    style={{ border: 0, tableLayout: 'fixed' }}
                >
                    <TableHeader name="meta" cellFormatter={truncateTableCell}>
                        Change
                    </TableHeader>
                </Table>
            );
        }

        return (
            <div className={styles.history}>
                <DataTableHeader
                    title={this.props.title}
                    actions={
                        <SwitchWithLabel checked={showData} onChange={this.toggleShowDiff.bind(this)}>
                            Full events
                        </SwitchWithLabel>
                    }
                />
                <div className={commonStyles.horisontalScroll}>{entries}</div>
            </div>
        );
    }
}
export default HistoryList;
