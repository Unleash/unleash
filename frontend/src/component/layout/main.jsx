import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Layout, Content, Footer, Grid, Cell } from 'react-mdl';

import styles from '../styles.scss';
import ErrorContainer from '../error/error-container';
import Header from '../menu/header';
import ShowApiDetailsContainer from '../api/show-api-details-container';
import { FooterMenu } from '../menu/footer';

export default class App extends PureComponent {
    static propTypes = {
        location: PropTypes.object.isRequired,
    };

    render() {
        return (
            <Layout fixedHeader>
                <Header location={this.props.location} />
                <Content className="mdl-color--grey-50" style={{ display: 'flex', flexDirection: 'column' }}>
                    <Grid noSpacing className={styles.content} style={{ flex: 1 }}>
                        <Cell col={12}>
                            {this.props.children}
                            <ErrorContainer />
                        </Cell>
                    </Grid>
                    <Footer size="mega">
                        <FooterMenu />
                        <ShowApiDetailsContainer />
                    </Footer>
                </Content>
            </Layout>
        );
    }
}
