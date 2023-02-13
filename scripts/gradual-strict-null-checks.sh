#!/usr/bin/env bash
SCRIPT_DIR=$( dirname -- $0 )
CURRENT_BRANCH=$(git branch --show-current)
MAIN_BRANCH=${1:-main}

git stash
git checkout "${MAIN_BRANCH}"
git stash pop
# update strictNullChecks
sed -i 's/\/\/\s*"strictNullChecks":\s*true,/"strictNullChecks": true,/' "${SCRIPT_DIR}/../tsconfig.json"
# count errors
MAIN_ERRORS=$(yarn 2> /dev/null | grep "Found [0-9]* errors" | sed 's/Found \(.*\) errors in .* files./\1/')

# reset tsconfig changes
git stash # including changes to tsconfig.json
git checkout "${CURRENT_BRANCH}"
git stash pop

# count errors
BRANCH_ERRORS=$(yarn 2> /dev/null | grep "Found [0-9]* errors" | sed 's/Found \(.*\) errors in .* files./\1/')

# reset tsconfig changes
git checkout -- "${SCRIPT_DIR}/../tsconfig.json"

if [ ${BRANCH_ERRORS} -gt ${MAIN_ERRORS} ]; then
    echo "Null check errors in ${CURRENT_BRANCH} are higher than in ${MAIN_BRANCH}: ${BRANCH_ERRORS} vs ${MAIN_ERRORS}. Please fix them before merging."
    exit 1
else
    echo "Branch null check errors: ${BRANCH_ERRORS} vs ${MAIN_BRANCH}: ${MAIN_ERRORS} - You're good to go!"
    exit 0
fi