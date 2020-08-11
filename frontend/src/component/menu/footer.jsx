import React from 'react';
import { FooterDropDownSection, FooterLinkList, FooterSection } from 'react-mdl';
import { NavLink } from 'react-router-dom';

import { baseRoutes as routes } from './routes';

export const FooterMenu = () => (
    <FooterSection type="middle">
        <FooterDropDownSection title="Menu">
            <FooterLinkList>
                {routes.map(item => (
                    <NavLink key={item.path} to={item.path}>
                        {item.title}
                    </NavLink>
                ))}
                <a href="https://github.com/Unleash/unleash/" target="_blank">
                    GitHub
                </a>
            </FooterLinkList>
        </FooterDropDownSection>
        <FooterDropDownSection title="Client SDKs">
            <FooterLinkList>
                <a href="https://github.com/Unleash/unleash-client-node/">Node.js</a>
                <a href="https://github.com/Unleash/unleash-client-java/">Java</a>
                <a href="https://github.com/Unleash/unleash-client-go/">Go</a>
                <a href="https://github.com/unleash/unleash-client-ruby">Ruby</a>
                <a href="https://github.com/Unleash/unleash-client-python">Python</a>
                <a href="https://github.com/Unleash/unleash-client-core">.Net Core</a>
                <a href="https://unleash.github.io/docs/client_sdk">All client SDKs</a>
            </FooterLinkList>
        </FooterDropDownSection>
    </FooterSection>
);
