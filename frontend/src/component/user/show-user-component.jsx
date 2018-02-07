import React from 'react';
import PropTypes from 'prop-types';
import styles from './user.scss';

export default class ShowUserComponent extends React.Component {
    static propTypes = {
        profile: PropTypes.object,
        location: PropTypes.object,
        fetchUser: PropTypes.func.isRequired,
        updateSettingLocation: PropTypes.func.isRequired,
    };
    possibleLocales = ['nb-NO', 'us-US', 'en-GB'];

    componentDidMount() {
        this.props.fetchUser();
    }

    updateLocale() {
        const locale = this.props.location ? this.props.location.locale : this.possibleLocales[0];
        let index = this.possibleLocales.findIndex(v => v === locale);
        index = (index + 1) % this.possibleLocales.length;
        this.props.updateSettingLocation('locale', this.possibleLocales[index]);
    }

    render() {
        const email = this.props.profile ? this.props.profile.email : '';
        const locale = this.props.location ? this.props.location.locale : this.possibleLocales[0];
        const imageUrl = email ? this.props.profile.imageUrl : 'public/unkown-user.png';
        const imageLocale = `public/${locale}.png`;
        return (
            <div className={styles.showUserSettings}>
                <div className={styles.showLocale}>
                    <img src={imageLocale} title={locale} alt={locale} onClick={this.updateLocale.bind(this)} />
                </div>&nbsp;
                <div className={styles.showUser}>
                    <img src={imageUrl} title={email} alt={email} />
                </div>
            </div>
        );
    }
}
