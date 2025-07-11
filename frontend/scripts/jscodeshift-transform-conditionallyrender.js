// @ts-check

export const parser = 'tsx';

const getAttr = (j, node, attribute) => {
    const attributes = node.value?.openingElement?.attributes || [];
    const attr = attributes.find(
        (attr) => j.JSXAttribute.check(attr) && attr.name.name === attribute,
    );

    if (!attr) {
        return null;
    }

    const value = attr.value;

    if (value.type === 'StringLiteral') {
        return value;
    }

    return value?.expression || null;
};

/** @type {import('jscodeshift').Transform} */
const transform = (file, api, options) => {
    const j = api.jscodeshift;
    const root = j(file.source);

    root.findJSXElements('ConditionallyRender')
        .forEach((path) => {
            const attributes = path.node.openingElement.attributes;

            attributes?.forEach((attr) => {
                if (
                    j.JSXAttribute.check(attr) &&
                    (attr.name.name === 'show' || attr.name.name === 'elseShow')
                ) {
                    const attrValue = attr.value;

                    // Check if the attribute value is an arrow function returning JSX
                    if (
                        j.JSXExpressionContainer.check(attrValue) &&
                        j.ArrowFunctionExpression.check(attrValue.expression)
                    ) {
                        const arrowFunctionBody = attrValue.expression.body;

                        if (
                            j.JSXElement.check(arrowFunctionBody) ||
                            j.JSXFragment.check(arrowFunctionBody)
                        ) {
                            // Replace the arrow function with the direct JSX element or fragment
                            attr.value =
                                j.jsxExpressionContainer(arrowFunctionBody);
                        }
                    }
                }
            });
        })
        .replaceWith((node) => {
            const isInJSX = ['JSXElement', 'JSXFragment'].includes(
                node.parent.value.type,
            );

            const condition = getAttr(j, node, 'condition');
            const show = getAttr(j, node, 'show');
            const elseShow = getAttr(j, node, 'elseShow');
            const alternate = elseShow === null ? j.nullLiteral() : elseShow;

            return isInJSX
                ? j.jsxExpressionContainer({
                      type: 'ConditionalExpression',
                      test: condition,
                      consequent: show,
                      alternate,
                  })
                : j.conditionalExpression(condition, show, alternate);
        });

    return root.toSource();
};

export default transform;
