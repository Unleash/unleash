import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { OverwriteWarning } from './OverwriteWarning.tsx';
import type { ChangeRequestState } from 'component/changeRequest/changeRequest.types';

test.each([
    ['Draft', true],
    ['Approved', true],
    ['In review', true],
    ['Applied', false],
    ['Scheduled', true],
    ['Cancelled', false],
    ['Rejected', false],
])('Shows warnings for CRs in the "%s" state: %s', (status, showWarning) => {
    render(
        <OverwriteWarning
            changesThatWouldBeOverwritten={[
                { property: 'some-prop', oldValue: 'old', newValue: 'new' },
            ]}
            changeType={'strategy'}
            changeRequestState={status as ChangeRequestState}
        />,
    );

    const hasRendered = screen.queryByText('Heads up!') !== null;
    expect(hasRendered).toBe(showWarning);
});
