import React, { Component } from 'react';
import { List, ListItem, ListSubHeader } from 'react-toolbox/lib/list';
import FontIcon from 'react-toolbox/lib/font_icon';
import Chip from 'react-toolbox/lib/chip';
import Switch from 'react-toolbox/lib/switch';

const ArchivedFeature = ({ feature, revive }) => {
    const { name, description, enabled, strategies } = feature;
    const actions = [
        <div>{strategies && strategies.map(s => <Chip><small>{s.name}</small></Chip>)}</div>,
        <FontIcon style={{ cursor: 'pointer' }} value="restore" onClick={() => revive(feature)} />,
    ];

    const leftActions = [
        <Switch disabled checked={enabled} />,
    ];

    return (
        <ListItem
            key={name}
            leftActions={leftActions}
            rightActions={actions}
            caption={name}
            legend={(description && description.substring(0, 100)) || '-'}
        />
    );
};

class ArchiveList extends Component {
    componentDidMount () {
        this.props.fetchArchive();
    }

    render () {
        const { archive, revive } = this.props;
        return (
            <List ripple >
                <ListSubHeader caption="Archive" />
                {archive.length > 0 ?
                    archive.map((feature, i) => <ArchivedFeature key={i} feature={feature} revive={revive} />) :
                    <ListItem caption="No archived feature toggles" />}
            </List>
        );
    }
}


export default ArchiveList;
