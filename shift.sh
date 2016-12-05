jscodeshift \
-t ../js-codemod/transforms/no-vars.js \
packages/ --ignore-pattern=node_modules --extensions=js,jsx \
&& \
jscodeshift \
-t ../js-codemod/transforms/object-shorthand.js \
packages/ --ignore-pattern=node_modules --extensions=js,jsx \
&& \
jscodeshift \
-t ../js-codemod/transforms/template-literals.js \
packages/ --ignore-pattern=node_modules --extensions=js,jsx \
&& \
jscodeshift \
-t ../js-codemod/transforms/unchain-variables.js \
packages/ --ignore-pattern=node_modules --extensions=js,jsx \
&& \
jscodeshift \
-t ../js-codemod/transforms/unquote-properties.js \
packages/ --ignore-pattern=node_modules --extensions=js,jsx \
&& \
jscodeshift \
-t ../js-codemod/transforms/arrow-function.js \
packages/ --ignore-pattern=node_modules --extensions=js,jsx \
&& \
jscodeshift \
-t ../js-codemod/transforms/use-strict.js \
packages/ --ignore-pattern=node_modules --extensions=js,jsx \




&& \
jscodeshift \
-t ../js-codemod/transforms/trailing-commas.js \
packages/ --ignore-pattern=node_modules --extensions=js,jsx \



