import React, { Component } from 'react';
import HistoryItemDiff from './history-item-diff';
import HistoryItemJson from './history-item-json';
import { Table, TableHeader } from 'react-mdl';
import { HeaderTitle, SwitchWithLabel } from '../common';

import style from './history.scss';

const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };

const formatDate = v => (new Date(v)).toLocaleString('nb-NO', dateOptions);

class HistoryList extends Component {

    toggleShowDiff () {
        this.props.updateSetting('showData', !this.props.settings.showData);
    }

    render () {
        const showData = this.props.settings.showData;
        const { history } = this.props;
        if (!history || history.length < 0) {
            return null;
        }

        let entries;

        if (showData) {
            entries =  history.map((entry) => <HistoryItemJson  key={`log${entry.id}`} entry={entry} />);
        } else {
            entries = (<Table
                    sortable
                    rows={
                        history.map((entry) => Object.assign({
                            diff: (<HistoryItemDiff  entry={entry} />),
                        }, entry))
                    }
                    style={{ width: '100%' }}
                >
                <TableHeader name="type">Type</TableHeader>
                <TableHeader name="createdBy">User</TableHeader>
                <TableHeader name="diff">Diff</TableHeader>
                <TableHeader numeric name="createdAt" cellFormatter={formatDate}>Time</TableHeader>
            </Table>);
        }

        return (
            <div className={style.history}>
                <HeaderTitle title={this.props.title} actions={
                    <SwitchWithLabel checked={showData} onChange={this.toggleShowDiff.bind(this)}>Show full events</SwitchWithLabel>
                }/>
                {entries}
            </div>
        );
    }
}
export default HistoryList;
