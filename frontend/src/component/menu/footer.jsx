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
            </FooterLinkList>
        </FooterDropDownSection>
        <FooterDropDownSection title="Clients">
            <FooterLinkList>
                <a href="https://github.com/Unleash/unleash-client-node/">Node.js</a>
                <a href="https://github.com/Unleash/unleash-client-java/">Java</a>
                <a href="https://github.com/Unleash/unleash-client-go/">Go</a>
            </FooterLinkList>
        </FooterDropDownSection>
    </FooterSection>
);
