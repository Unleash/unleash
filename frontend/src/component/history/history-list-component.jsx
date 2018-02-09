import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HistoryItemDiff from './history-item-diff';
import HistoryItemJson from './history-item-json';
import { Table, TableHeader } from 'react-mdl';
import { DataTableHeader, SwitchWithLabel, styles as commonStyles } from '../common';
import { formatFullDateTimeWithLocale } from '../common/util';

import styles from './history.scss';

class HistoryList extends Component {
    static propTypes = {
        title: PropTypes.string,
        history: PropTypes.array,
        settings: PropTypes.object,
        location: PropTypes.object,
        updateSetting: PropTypes.func.isRequired,
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
                    sortable
                    rows={history.map(entry =>
                        Object.assign(
                            {
                                diff: <HistoryItemDiff entry={entry} />,
                            },
                            entry
                        )
                    )}
                    className={commonStyles.fullwidth}
                    style={{ border: 0, tableLayout: 'fixed', minWidth: '840px' }}
                >
                    <TableHeader name="type" cellFormatter={truncateTableCell} style={{ width: '136px' }}>
                        Type
                    </TableHeader>
                    <TableHeader name="createdBy" cellFormatter={truncateTableCell} style={{ width: '115px' }}>
                        User
                    </TableHeader>
                    <TableHeader name="diff">Diff</TableHeader>
                    <TableHeader
                        numeric
                        name="createdAt"
                        cellFormatter={this.formatFulldateTime.bind(this)}
                        style={{ width: '165px' }}
                    >
                        Time
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
