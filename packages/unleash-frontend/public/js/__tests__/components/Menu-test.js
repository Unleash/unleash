/** @jsx React.DOM */

'use strict';

jest.dontMock('../../components/Menu');

const Menu = require('../../components/Menu');
const React = require('react/addons');
const TestUtils = React.addons.TestUtils;

describe('Menu test', () => {
    it('should include unleash in menu', () => {
        const Compononent = TestUtils .renderIntoDocument(<Menu />);
        expect(Compononent.getDOMNode().textContent).toMatch('unleash');
    });
});
