#!/usr/bin/env bash
SCRIPT_DIR=$( dirname -- $0 )
CURRENT_BRANCH=$(git branch --show-current)
MAIN_BRANCH=${0:-main}

git checkout ${MAIN_BRANCH}
# update strictNullChecks
sed -i 's/\/\/\s*"strictNullChecks":\s*true,/"strictNullChecks": true,/' ${SCRIPT_DIR}/../tsconfig.json
# count errors
MAIN_ERRORS=$(yarn 2> /dev/null | grep "Found [0-9]* errors" | sed 's/Found \(.*\) errors in .* files./\1/')

# reset tsconfig changes
git checkout -- ${SCRIPT_DIR}/../tsconfig.json
git checkout ${CURRENT_BRANCH}

# update strictNullChecks
sed -i 's/\/\/\s*"strictNullChecks":\s*true,/"strictNullChecks": true,/' ${SCRIPT_DIR}/../tsconfig.json
# count errors
BRANCH_ERRORS=$(yarn 2> /dev/null | grep "Found [0-9]* errors" | sed 's/Found \(.*\) errors in .* files./\1/')

# reset tsconfig changes
git checkout -- ${SCRIPT_DIR}/../tsconfig.json

if [ ${MAIN_ERRORS} -gt ${BRANCH_ERRORS} ]; then
    echo "You have introduced ${MAIN_ERRORS} null check errors in your branch. Please fix them before merging."
    exit 1
fi