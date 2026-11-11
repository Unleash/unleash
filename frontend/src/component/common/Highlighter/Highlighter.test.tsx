import { expect, test } from 'vitest';
import { render } from '@testing-library/react';
import { Highlighter } from './Highlighter.tsx'; // adjust the import path accordingly

test('renders children when there is no search term', () => {
    const { container } = render(<Highlighter>Test Text</Highlighter>);

    expect(container.innerHTML).toContain('Test Text');
});

test('highlights the search term', () => {
    const { container } = render(
        <Highlighter search='Test'>Test Text</Highlighter>,
    );

    expect(container.innerHTML).toContain('<mark>Test</mark>');
});

test('does not highlight when search term is not present in children', () => {
    const { container } = render(
        <Highlighter search='Hello'>Test Text</Highlighter>,
    );

    expect(container.innerHTML).not.toContain('<mark>');
});

test('is case insensitive by default', () => {
    const { container } = render(
        <Highlighter search='test'>Test Text</Highlighter>,
    );

    expect(container.innerHTML).toContain('<mark>Test</mark>');
});

test('respects case sensitivity when specified', () => {
    const { container } = render(
        <Highlighter search='test' caseSensitive={true}>
            Test Text
        </Highlighter>,
    );

    expect(container.innerHTML).not.toContain('<mark>');
});

test('highlights multiple search terms', () => {
    const { container } = render(
        <Highlighter search='Test,Text'>Test Text</Highlighter>,
    );

    expect(container.innerHTML).toContain('<mark>Test</mark>');
    expect(container.innerHTML).toContain('<mark>Text</mark>');
});

test('highlights first match on conflict', () => {
    const { container } = render(
        <Highlighter search='Test,stText'>TestText</Highlighter>,
    );

    expect(container.innerHTML).toContain('<mark>Test</mark>');
    expect(container.innerHTML).not.toContain('<mark>stText</mark>');
});

test.each([
    ['trailing comma', 'x,'],
    ['leading comma', ',x'],
    ['repeated commas', 'x,,'],
    ['whitespace-only term', 'x, '],
])('ignores empty search terms (%s)', (_description, search) => {
    const { container } = render(
        <Highlighter search={search}>Test Text</Highlighter>,
    );

    expect(container.textContent).toBe('Test Text');
    expect(
        Array.from(container.querySelectorAll('mark')).map(
            (mark) => mark.textContent,
        ),
    ).toEqual(['x']);
});

test('keeps the text between matches when a term is empty', () => {
    const { container } = render(
        <Highlighter search='Test, '>my Test flag</Highlighter>,
    );

    expect(container.textContent).toBe('my Test flag');
    expect(container.innerHTML).toContain('my <mark>Test</mark> flag');
});

test.each([
    ['a comma', ','],
    ['whitespace', '   '],
    ['commas and whitespace', ' , ,'],
])('renders plain text when the search is only %s', (_description, search) => {
    const { container } = render(
        <Highlighter search={search}>Test Text</Highlighter>,
    );

    expect(container.textContent).toBe('Test Text');
    expect(container.querySelector('mark')).toBeNull();
});
