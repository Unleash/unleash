import React, { Component } from 'react';
import { Link } from 'react-router';
import { DataTable, TableHeader, IconButton, Icon } from 'react-mdl';
import { HeaderTitle } from '../common';

class ArchiveList extends Component {
    componentDidMount () {
        this.props.fetchArchive();
    }

    render () {
        const { archive, revive } = this.props;
        archive.forEach(e => {
            e.reviveName = e.name;
        });
        return (
            <div>
                <HeaderTitle title="Toggle Archive" />
                {
                    archive.length > 0 ?
                    <DataTable
                        rows={archive}
                        style={{ width: '100%' }}>
                        <TableHeader style={{ width: '25px' }} name="reviveName" cellFormatter={(reviveName) => (
                            <IconButton colored name="undo" onClick={() => revive(reviveName)} />
                        )}>Revive</TableHeader>
                        <TableHeader style={{ width: '25px' }} name="enabled" cellFormatter={(v) => (v ? 'Yes' : '-')}>Enabled</TableHeader>
                        <TableHeader name="name">Toggle name</TableHeader>
                        <TableHeader numeric name="createdAt">Created</TableHeader>
                    </DataTable> :
                    <div style={{ textAlign: 'center' }}>
                        <Icon name="report" style={{ color: '#aaa', fontSize: '40px' }}/><br />
                        No archived feature toggles, go see <Link to="/features">active toggles here</Link>
                    </div>
                }
            </div>
        );
    }
}


export default ArchiveList;
