import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Layout, Content, Footer, Grid, Cell } from 'react-mdl';

import styles from '../styles.module.scss';
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
                <Content className={classnames('mdl-color--grey-50', styles.contentWrapper)}>
                    <Grid noSpacing className={styles.content}>
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
