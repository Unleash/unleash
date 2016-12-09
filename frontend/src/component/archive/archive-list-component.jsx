import React, { Component } from 'react';
import { DataTable, TableHeader, Chip, Switch, IconButton } from 'react-mdl';

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
                <h6>Toggle Archive</h6>

                <DataTable
                    rows={archive}
                    style={{ width: '100%' }}>
                    <TableHeader style={{ width: '25px' }} name="reviveName" cellFormatter={(reviveName) => (
                        <IconButton colored name="undo" onClick={() => revive(reviveName)} />
                    )}>Revive</TableHeader>
                    <TableHeader style={{ width: '25px' }} name="enabled" cellFormatter={(v) => (v ? 'Yes' : '-')}>Enabled</TableHeader>
                    <TableHeader name="name">Toggle name</TableHeader>
                    <TableHeader numeric name="createdAt">Created</TableHeader>
                </DataTable>
            </div>
        );
    }
}


export default ArchiveList;
