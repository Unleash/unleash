import { expect, test } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import type { TagValuesUsageSchemaTagValuesItem } from 'openapi';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import ToastRenderer from 'component/common/ToastRenderer/ToastRenderer';
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

const renderWithPermission = () =>
    render(
        <>
            <TagValuesTable tagType='team' />
            <ToastRenderer />
        </>,
        { permissions: [{ permission: UPDATE_FEATURE }] },
    );

const clickInRow = async (value: string, button: string) => {
    const row = (await screen.findByText(value)).closest('tr')!;
    await userEvent.click(within(row).getByRole('button', { name: button }));
};

test('deletes a tag value after describing the impact', async () => {
    const used = tagValue({
        value: 'needs/review',
        usedInActiveFeatures: 2,
        usedInArchivedFeatures: 1,
    });
    setupTagValues([used, tagValue({ value: 'kept' })]);
    renderWithPermission();

    await clickInRow('needs/review', 'Delete tag value');

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent(
        "team:needs/review will be removed from 2 active flags, plus any in private projects you can't see.",
    );

    testServerRoute(
        server,
        '/api/admin/tags/team/needs%2Freview',
        {},
        'delete',
    );
    setupTagValues([tagValue({ value: 'kept' })]);
    await userEvent.click(
        within(dialog).getByRole('button', { name: 'Delete' }),
    );

    await waitFor(() =>
        expect(screen.queryByText('needs/review')).not.toBeInTheDocument(),
    );
});

test('says when a tag value is not assigned to any flags the user can access', async () => {
    setupTagValues([tagValue({ value: 'unused' })]);
    renderWithPermission();

    await clickInRow('unused', 'Delete tag value');

    expect(await screen.findByRole('dialog')).toHaveTextContent(
        "team:unused isn't added to any active flags that you have access to.",
    );
});

test('renames a tag value after confirming', async () => {
    setupTagValues([tagValue({ value: 'old', usedInActiveFeatures: 1 })]);
    renderWithPermission();

    await clickInRow('old', 'Rename tag value');
    const input = screen.getByRole('textbox', { name: 'New value for old' });
    await userEvent.clear(input);
    await userEvent.type(input, ' new {Enter}');

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent(
        "team:old will be renamed to team:new on 1 active flag, plus any in private projects you can't see.",
    );

    const { requests } = testServerRoute(
        server,
        '/api/admin/tags/team/old/rename',
        {},
        'post',
    );
    setupTagValues([tagValue({ value: 'new', usedInActiveFeatures: 1 })]);
    await userEvent.click(
        within(dialog).getByRole('button', { name: 'Rename' }),
    );

    await screen.findByText('new');
    expect(requests).toEqual([{ value: 'new' }]);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
});

test('closes the editor without confirming when the new value is blank', async () => {
    setupTagValues([tagValue({ value: 'old' })]);
    renderWithPermission();

    await clickInRow('old', 'Rename tag value');
    const input = screen.getByRole('textbox', { name: 'New value for old' });
    await userEvent.clear(input);
    await userEvent.type(input, '  {Enter}');

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    screen.getByText('old');
});

test('cancels renaming with Escape', async () => {
    setupTagValues([tagValue({ value: 'old' })]);
    renderWithPermission();

    await clickInRow('old', 'Rename tag value');
    await userEvent.type(
        screen.getByRole('textbox', { name: 'New value for old' }),
        '-changed{Escape}',
    );

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    screen.getByText('old');
});

test('cancels renaming when clicking outside the field', async () => {
    setupTagValues([tagValue({ value: 'old' })]);
    renderWithPermission();

    await clickInRow('old', 'Rename tag value');
    await userEvent.type(
        screen.getByRole('textbox', { name: 'New value for old' }),
        '-changed',
    );
    await userEvent.click(screen.getByText('Tag values'));

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    screen.getByText('old');
});

test('keeps the field open when the rename is cancelled in the dialog', async () => {
    setupTagValues([tagValue({ value: 'old' })]);
    renderWithPermission();

    await clickInRow('old', 'Rename tag value');
    await userEvent.type(
        screen.getByRole('textbox', { name: 'New value for old' }),
        '-changed{Enter}',
    );
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(
        within(dialog).getByRole('button', { name: 'Cancel' }),
    );

    await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(
        screen.getByRole('textbox', { name: 'New value for old' }),
    ).toHaveValue('old-changed');
});

test('keeps the rename open when the new value already exists', async () => {
    setupTagValues([tagValue({ value: 'old' })]);
    testServerRoute(
        server,
        '/api/admin/tags/team/old/rename',
        { message: 'A tag with this value already exists' },
        'post',
        409,
    );
    renderWithPermission();

    await clickInRow('old', 'Rename tag value');
    const input = screen.getByRole('textbox', { name: 'New value for old' });
    await userEvent.clear(input);
    await userEvent.type(input, 'taken{Enter}');
    const dialog = await screen.findByRole('dialog');
    const confirm = within(dialog).getByRole('button', { name: 'Rename' });
    await userEvent.click(confirm);

    await screen.findByText('A tag with this value already exists');
    expect(dialog).toBeInTheDocument();
    expect(
        screen.getByRole('textbox', {
            name: 'New value for old',
            hidden: true,
        }),
    ).toHaveValue('taken');
});
