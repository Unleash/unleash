export const getContributors = (commits) => {
    // filter out commits that don't have an author
    const commitsWithAuthors = commits.filter((commit) => !!commit.author);

    // use a Set to deduplicate the list of contributors
    const contributorSet = new Set();
    for (const commit of commitsWithAuthors) {
        contributorSet.add(JSON.stringify(commit.author));
    }

    const contributors = Array.from(contributorSet).map((str) => {
        const contributor = JSON.parse(str);
        const { login, html_url, avatar_url } = contributor;
        return { login, html_url, avatar_url };
    });

    // sort alphabetically
    contributors.sort((a, b) => {
        return a.login.localeCompare(b.login);
    });

    return contributors;
};
