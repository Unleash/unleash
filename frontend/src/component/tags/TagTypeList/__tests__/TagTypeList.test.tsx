import React from 'react';
import { TagTypeList } from 'component/tags/TagTypeList/TagTypeList';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import UIProvider from 'component/providers/UIProvider/UIProvider';
import { ThemeProvider } from 'themes/ThemeProvider';
import { AccessProviderMock } from 'component/providers/AccessProvider/AccessProviderMock';

test('renders an empty list correctly', () => {
    const tree = renderer.create(
        <MemoryRouter>
            <ThemeProvider>
                <UIProvider>
                    <AccessProviderMock permissions={[{ permission: ADMIN }]}>
                        <TagTypeList />
                    </AccessProviderMock>
                </UIProvider>
            </ThemeProvider>
        </MemoryRouter>
    );
    expect(tree).toMatchSnapshot();
});
