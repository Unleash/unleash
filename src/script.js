const crypto = require('crypto');

// Function to generate a random hexadecimal string
function generateRandomName() {
    return crypto.randomBytes(6).toString('hex');
}

// Function to create a new project with a random name
async function createProject(apiKey) {
    const url = 'http://localhost:3000/api/admin/projects';
    const randomProjectName = generateRandomName();

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey,
            },
            body: JSON.stringify({
                id: randomProjectName, // Assuming the ID should be unique; we're using the name here.
                name: randomProjectName,
                description: 'Project with ID: ' + randomProjectName, // Add a real description here
                defaultStickiness: 'default',
                mode: 'open',
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating project:', error);
    }
}

// Function to create a feature toggle within the specified project
async function createFeatureToggle(projectId, apiKey) {
    const url = `http://localhost:4242/api/admin/projects/${projectId}/features`;
    const randomFeatureName = generateRandomName();

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey,
            },
            body: JSON.stringify({
                type: 'release',
                name: randomFeatureName,
                description: 'Feature toggle with name: ' + randomFeatureName, // Add a real description here
                impressionData: false,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating feature toggle:', error);
    }
}

// Main function to seed the projects and feature toggles
async function seedProjectsAndFeatures(projectCount, featureCountPerProject, apiKey) {
    for (let j = 0; j < featureCountPerProject; j++) {
        const featureToggle = await createFeatureToggle('default', apiKey);
        console.log('Created feature toggle:', featureToggle);
    }
}

// Use the functions
const apiKey = '*:*.964a287e1b728cb5f4f3e0120df92cb5'; // replace with your actual API key
const numberOfProjects = 10; // replace with the desired number of projects
const numberOfFeatureTogglesPerProject = 150; // replace with the desired number of feature toggles per project
seedProjectsAndFeatures(numberOfProjects, numberOfFeatureTogglesPerProject, apiKey);
