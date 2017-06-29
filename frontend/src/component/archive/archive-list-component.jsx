import React, { Component } from 'react';
import { Link } from 'react-router';
import { DataTable, TableHeader, IconButton, Icon, Card } from 'react-mdl';
import { styles as commonStyles } from '../common';

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
            <Card shadow={0} className={commonStyles.fullwidth}>
                {
                    archive.length > 0 ?
                        <div className={commonStyles.horisontalScroll}>
                            <DataTable
                                rows={archive}
                                className={commonStyles.fullwidth}
                                style={{ border: 0 }}>
                                <TableHeader style={{ width: '25px' }} name="reviveName" cellFormatter={(reviveName) => (
                                    <IconButton colored name="undo" onClick={() => revive(reviveName)} />
                                )}>Revive</TableHeader>
                                <TableHeader style={{ width: '25px' }} name="enabled" cellFormatter={(v) => (v ? 'Yes' : '-')}>
                                Enabled</TableHeader>
                                <TableHeader name="name">Toggle name</TableHeader>
                                <TableHeader numeric name="createdAt">Created</TableHeader>
                            </DataTable>
                        </div> :
                        <div className={commonStyles.emptyState}>
                            <Icon name="archive" className="mdl-color-text--grey-300" style={{ fontSize: '56px' }}/><br />
                            No archived feature toggles, go see <Link to="/features">active toggles here</Link>
                        </div>
                }
            </Card>
        );
    }
}


export default ArchiveList;
