/** @jsx React.DOM */

jest.dontMock("../../components/Menu");

var Menu = require("../../components/Menu");
var React = require("react/addons");
var TestUtils = React.addons.TestUtils;

describe('Menu test', function () {
    it('should include unleash in menu', function () {
        var Compononent = TestUtils .renderIntoDocument(<Menu />);
        expect(Compononent.getDOMNode().textContent).toMatch('unleash');
    });
});