import { expect, test } from 'vitest';
import { TagTypeList } from 'component/tags/TagTypeList/TagTypeList';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import UIProvider from 'component/providers/UIProvider/UIProvider';
import { ThemeProvider } from 'themes/ThemeProvider';
import { AccessProviderMock } from 'component/providers/AccessProvider/AccessProviderMock';
import { AnnouncerProvider } from 'component/common/Announcer/AnnouncerProvider/AnnouncerProvider';

test('renders an empty list correctly', () => {
    const { asFragment } = render(
        <MemoryRouter>
            <ThemeProvider>
                <AnnouncerProvider>
                    <UIProvider>
                        <AccessProviderMock
                            permissions={[{ permission: ADMIN }]}
                        >
                            <TagTypeList />
                        </AccessProviderMock>
                    </UIProvider>
                </AnnouncerProvider>
            </ThemeProvider>
        </MemoryRouter>,
    );
    expect(asFragment()).toMatchSnapshot();
});
