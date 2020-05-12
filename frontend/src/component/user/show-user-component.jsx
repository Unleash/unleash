import React from 'react';
import PropTypes from 'prop-types';
import styles from './user.scss';
import { Menu, MenuItem } from 'react-mdl';

export default class ShowUserComponent extends React.Component {
    static propTypes = {
        profile: PropTypes.object,
        location: PropTypes.object,
        fetchUser: PropTypes.func.isRequired,
        updateSettingLocation: PropTypes.func.isRequired,
    };
    possibleLocales = [
        { value: 'en-US', image: 'en-US' },
        { value: 'en-GB', image: 'en-GB' },
        { value: 'nb-NO', image: 'nb-NO' },
        { value: 'sv-SE', image: 'sv-SE' },
        { value: 'da-DK', image: 'da-DK' },
        { value: 'en-IN', image: 'en-IN' },
        { value: 'de', image: 'de_DE' },
        { value: 'cs', image: 'cs_CZ' },
        { value: 'pt-BR', image: 'pt_BR' },
        { value: 'fr-FR', image: 'fr-FR' },
    ];

    componentDidMount() {
        this.props.fetchUser();
        // find default locale and add it in choices if not present
        const locale = navigator.language || navigator.userLanguage;
        let found = this.possibleLocales.find(l => l.value === locale);
        if (!found) {
            this.possibleLocales.push({ value: locale, image: 'unknown-locale' });
        }
    }

    getLocale() {
        return (this.props.location && this.props.location.locale) || navigator.language || navigator.userLanguage;
    }

    setLocale(locale) {
        this.props.updateSettingLocation('locale', locale.value);
    }

    render() {
        const email = this.props.profile ? this.props.profile.email : '';
        const locale = this.getLocale();
        let foundLocale = this.possibleLocales.find(l => l.value === locale);
        const imageUrl = email ? this.props.profile.imageUrl : 'public/unknown-user.png';
        const imageLocale = foundLocale ? `public/${foundLocale.image}.png` : `public/unknown-locale.png`;
        return (
            <div className={styles.showUserSettings}>
                <div className={styles.showLocale} id="select-locale" style={{ cursor: 'pointer' }}>
                    <img src={imageLocale} title={`Current locale is ${locale}`} alt={locale} />
                </div>
                <Menu target="select-locale" valign="bottom" align="right" ripple>
                    {this.possibleLocales.map(i => (
                        <MenuItem key={i.value} style={{ textAlign: 'center' }} onClick={() => this.setLocale(i)}>
                            <div className={styles.showLocale}>
                                <img src={`public/${i.image}.png`} title={i.value} alt={i.value} />
                            </div>
                        </MenuItem>
                    ))}
                </Menu>
                &nbsp;
                <div className={styles.showUser}>
                    <img src={imageUrl} title={email} alt={email} />
                </div>
            </div>
        );
    }
}
