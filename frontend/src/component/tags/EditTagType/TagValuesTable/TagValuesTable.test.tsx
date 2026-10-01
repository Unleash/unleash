import { expect, test } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import type { TagValuesUsageSchemaTagValuesItem } from 'openapi';
import { TagValuesTable } from './TagValuesTable.tsx';

const server = testServerSetup();

const tagValue = (
    overrides: Partial<TagValuesUsageSchemaTagValuesItem> &
        Pick<TagValuesUsageSchemaTagValuesItem, 'value'>,
): TagValuesUsageSchemaTagValuesItem => ({
    usedInActiveFeatures: 0,
    usedInArchivedFeatures: 0,
    ...overrides,
});

const setupTagValues = (
    tagValues: TagValuesUsageSchemaTagValuesItem[],
    total = tagValues.length,
) => {
    testServerRoute(server, '/api/admin/tag-types/team/values', {
        limit: 1000,
        offset: 0,
        total,
        tagValues,
    });
};

const valuesInOrder = () =>
    screen
        .getAllByRole('row')
        .slice(1)
        .map((row) => within(row).getAllByRole('cell')[0].textContent);

const sortByUsage = () =>
    userEvent.click(screen.getByRole('button', { name: /Used in/ }));

test('sorts values in natural order by default', async () => {
    setupTagValues([
        tagValue({ value: 'value-10' }),
        tagValue({ value: 'beta' }),
        tagValue({ value: 'value-2' }),
    ]);

    render(<TagValuesTable tagType='team' />);

    await screen.findByText('beta');
    expect(valuesInOrder()).toEqual(['beta', 'value-2', 'value-10']);
});

test('sorts by active usage, keeping tied values in natural order', async () => {
    setupTagValues([
        tagValue({ value: 'unused' }),
        tagValue({ value: 'value-10', usedInActiveFeatures: 1 }),
        tagValue({ value: 'most-used', usedInActiveFeatures: 5 }),
        tagValue({ value: 'value-2', usedInActiveFeatures: 1 }),
    ]);
    render(<TagValuesTable tagType='team' />);
    await screen.findByText('most-used');

    await sortByUsage();
    const descending = ['most-used', 'value-2', 'value-10', 'unused'];
    expect(valuesInOrder()).toEqual(descending);

    await sortByUsage();
    expect(valuesInOrder()).toEqual([
        'unused',
        'value-2',
        'value-10',
        'most-used',
    ]);

    await sortByUsage();
    expect(valuesInOrder()).toEqual(descending);
});

test('shows archived flags on a second line only when there are any', async () => {
    setupTagValues([
        tagValue({
            value: 'with-archived',
            usedInActiveFeatures: 2,
            usedInArchivedFeatures: 1,
        }),
        tagValue({ value: 'active-only', usedInActiveFeatures: 1 }),
    ]);

    render(<TagValuesTable tagType='team' />);

    const withArchived = (await screen.findByText('with-archived')).closest(
        'tr',
    )!;
    within(withArchived).getByText('2 active flags');
    within(withArchived).getByText('1 archived flag');

    const activeOnly = screen.getByText('active-only').closest('tr')!;
    within(activeOnly).getByText('1 active flag');
    expect(within(activeOnly).queryByText(/archived/)).not.toBeInTheDocument();
});

test('says how many values are shown when the tag type has more than one page', async () => {
    setupTagValues([tagValue({ value: 'first' })], 1001);

    render(<TagValuesTable tagType='team' />);

    await screen.findByText('Showing the first 1 of 1001 values.');
});

test('shows an empty state for a tag type without values', async () => {
    setupTagValues([]);

    render(<TagValuesTable tagType='team' />);

    await screen.findByText('No values for this tag type yet.');
});

test('shows an error instead of the empty state when values fail to load', async () => {
    testServerRoute(server, '/api/admin/tag-types/team/values', {}, 'get', 500);

    render(<TagValuesTable tagType='team' />);

    await screen.findByText("Couldn't load the tag values.");
    expect(
        screen.queryByText('No values for this tag type yet.'),
    ).not.toBeInTheDocument();
});
