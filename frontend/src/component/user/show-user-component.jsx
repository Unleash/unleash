import React from 'react';
import PropTypes from 'prop-types';
import styles from './user.scss';

export default class ShowUserComponent extends React.Component {
    static propTypes = {
        profile: PropTypes.object,
    };

    componentDidMount() {
        this.props.fetchUser();
    }

    render() {
        const email = this.props.profile ? this.props.profile.email : '';
        const imageUrl = email ? this.props.profile.imageUrl : '';
        return (
            <div className={styles.showUser}>
                <img src={imageUrl} title={email} alt={email} />
            </div>
        );
    }
}
