---
title: Go Feature Flag Examples
slug: /feature-flag-tutorials/golang/examples
---

In our [Go feature flag tutorial](/feature-flag-tutorials/go), we implemented a simple feature flag that could be turned on and off. This document will walk you through other examples of what can be achieved using feature flags in Go.

We built many features into Unleash, our open-source feature flag platform, to address the complexities of releasing code. This tutorial will explore the following:

- [Gradual Rollouts for Go Apps](#gradual-rollouts-for-go-apps)
- [Canary Deployments in Go](#canary-deployments-in-go)
  - [What is a canary deployment?](#what-is-a-canary-deployment)
  - [Why use canary deployments?](#why-use-canary-deployments)
  - [How to do canary deployments with a feature flag in Go?](#how-to-do-canary-deployments-with-a-feature-flag-in-go)
  - [Configure strategy constraints for canary deployments](#configure-strategy-constraints-for-canary-deployments)
- [Server-side A/B Testing in Go](#server-side-ab-testing-in-go)
- [Feature Flag Analytics and Reporting in Go](#feature-flag-analytics-and-reporting-in-go)
  - [Enable impression data events in Go](#enable-impression-data-events-in-go)
- [Application Metrics and Monitoring for Go apps](#application-metrics-and-monitoring-for-go-apps)
- [Feature Flag Audit Logs in Go](#feature-flag-audit-logs-in-go)
- [Flag Automation and Workflow Integration for Go Apps](#flag-automation-and-workflow-integration-for-go-apps)

## Gradual Rollouts for Go Apps

It is common to use feature flags to roll out changes to a percentage of users, and we can use Unleash to do that too.

Open a feature flag and select an environment where the flag is enabled. Click **Edit strategy**.

![The "edit strategy" button uses a pencil icon and is located on every strategy.](/img/go-example-strategy.png)

Adjust the percentage of users to 50% or whichever value you choose, and refresh your app in the browser to see if your user has the new feature experience. This might take 30 seconds for a server-side app to propagate.

![A gradual rollout form can allow you to customize your flag strategy.](/img/go-example-rollout.png)

You can achieve the same result using our API with the following code:

```go
payload := map[string]interface{}{
    "name":     "flexibleRollout",
    "disabled": false,
    "constraints": []interface{}{},
    "variants":    []interface{}{},
    "parameters": map[string]interface{}{
        "groupId":    "delete_survey_flag",
        "rollout":    "50",
        "stickiness": "sessionId",
    },
    "segments": []interface{}{},
}

jsonData, err := json.Marshal(payload)

url := fmt.Sprintf("%s/api/admin/projects/%s/features/%s/environments/%s/strategies",
    unleashURL, projectID, featureName, environment)

req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))

req.Header.Set("Content-Type", "application/json")
req.Header.Set("Authorization", apiKey)

client := &http.Client{}
resp, err := client.Do(req)
defer resp.Body.Close()
```

Learn more about [gradual rollouts in our docs](/reference/activation-strategies). Also, learn more about our [API for creating a new strategy](/reference/api/unleash/update-feature-strategy) for your flags.

## Canary Deployments in Go

### What is a canary deployment?

Canary deployments are a foundational approach for deploying new software versions with high confidence and low risk by exposing the new version to a limited audience. Canary releases are a way to test and release code in different environments for a subset of your audience, which determines which features or versions of the platform people have access to.

### Why use canary deployments?

Canary deployments are a safer and more gradual way to make changes in software development. They help find any abnormalities and align with the agile process for faster releases and quick reversions.

### How to do canary deployments with a feature flag in Go?

Feature flags provide the same benefits as canary deployments but with more granular control:

-   Precisely target specific user segments for feature rollouts.
-   Maintain session consistency (stickiness) if needed.
-   Test multiple features independently on different user groups simultaneously.
-   With feature flags, you can separate feature releases from deployments.

Often, canary deployments are managed at the load balancer level while feature flags act at the application level. In some instances, rolling out groups of features together behind a feature flag can serve the purpose of a canary deployment.

### Configure strategy constraints for canary deployments

Let's update our existing gradual rollout strategy using Go to add environment-based constraints:

```go
payload := map[string]interface{}{
    "name":     "flexibleRollout",
    "disabled": false,
    "constraints": []map[string]interface{}{
        {
            "values":         []string{"production"},
            "inverted":       false,
            "operator":       "NOT_IN",
            "contextName":    "environment",
            "caseInsensitive": false,
        },
    },
    "variants": []interface{}{},
    "parameters": map[string]interface{}{
        "groupId":    "delete_survey_flag",
        "rollout":    "50",
        "stickiness": "sessionId",
    },
    "segments": []interface{}{},
}

jsonData, err := json.Marshal(payload)

url := fmt.Sprintf("%s/api/admin/projects/%s/features/%s/environments/%s/strategies/%s",
    unleashURL, projectID, featureName, environment, strategyID)

req, err := http.NewRequest("PUT", url, bytes.NewBuffer(jsonData))

req.Header.Set("Content-Type", "application/json")
req.Header.Set("Authorization", apiKey)

client := &http.Client{}
resp, err := client.Do(req)
defer resp.Body.Close()
```

## Server-side A/B Testing in Go

A/B testing allows you to test multiple versions of a feature with different user groups. In Go, we can implement this using strategy variants. Here's how to update a strategy to enable A/B testing for 50% of users:

```go
payload := map[string]interface{}{
    "name":  "flexibleRollout",
    "title": "",
    "constraints": []interface{}{},
    "parameters": map[string]interface{}{
        "rollout":    "50",
        "stickiness": "default",
        "groupId":    "",
    },
    "variants":  []interface{}{},
    "segments":  []interface{}{},
    "disabled": false,
}

jsonData, err := json.Marshal(payload)

url := fmt.Sprintf("%s/api/admin/projects/%s/features/%s/environments/%s/strategies/%s",
    unleashURL, projectID, featureName, environment, strategyID)

req, err := http.NewRequest("PUT", url, bytes.NewBuffer(jsonData))


req.Header.Set("Content-Type", "application/json")
req.Header.Set("Authorization", apiKey)

client := &http.Client{}
resp, err := client.Do(req)
defer resp.Body.Close()
```

## Feature Flag Analytics and Reporting in Go

Shipping code is one thing, but monitoring your applications is another aspect of managing code. For example, you could use feature flag analytics to monitor performance metrics or track user behavior.


### Enable impression data events in Go

Let's walk through how to enable impression data using Go's HTTP client:

```go
payload := []map[string]interface{}{
    {
        "op":    "replace",
        "path":  "/impressionData",
        "value": true,
    },
}

jsonData, err := json.Marshal(payload)


url := fmt.Sprintf("%s/api/admin/projects/%s/features/%s", 
    unleashURL, projectID, featureName)

req, err := http.NewRequest("PATCH", url, bytes.NewBuffer(jsonData))

req.Header.Set("Content-Type", "application/json")
req.Header.Set("Authorization", apiKey)

client := &http.Client{}
resp, err := client.Do(req)
defer resp.Body.Close()
```

## Application Metrics and Monitoring for Go apps

In Go applications, you can implement metrics collection using the Unleash client SDK. Here's an example of how to track metrics for your feature flags:

```go
type MetricsData struct {
    AppName    string                 `json:"appName"`
    InstanceID string                 `json:"instanceId"`
    Bucket     map[string]ToggleStats `json:"bucket"`
}

type ToggleStats struct {
    Yes int `json:"yes"`
    No  int `json:"no"`
}

func fetchMetrics(unleashURL, featureName, apiKey string) error {
    url := fmt.Sprintf("%s/api/admin/metrics/feature-toggles/%s", unleashURL, featureName)

    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        return fmt.Errorf("error creating request: %v", err)
    }

    req.Header.Set("Authorization", apiKey)

    client := &http.Client{
        Timeout: 10 * time.Second,
    }
    
    resp, err := client.Do(req)
    if err != nil {
        return fmt.Errorf("error making request: %v", err)
    }
    defer resp.Body.Close()

    var metricsData MetricsData
    if err := json.NewDecoder(resp.Body).Decode(&metricsData); err != nil {
        return fmt.Errorf("error decoding response: %v", err)
    }

    // Process metrics data
    fmt.Printf("Metrics for %s: %+v\n", featureName, metricsData)
    return nil
}
```

## Feature Flag Audit Logs in Go

Implementing audit logging in your Go application helps track changes to feature flags over time. Here's how to retrieve and process audit logs:

```go
func getAuditLogs(unleashURL, featureName, apiKey string) error {
    url := fmt.Sprintf("%s/api/admin/events/%s", unleashURL, featureName)

    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        return fmt.Errorf("error creating request: %v", err)
    }

    req.Header.Add("Accept", "application/json")
    req.Header.Add("Authorization", apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return fmt.Errorf("error making request: %v", err)
    }
    defer resp.Body.Close()

    body, err := io.ReadAll(resp.Body)
    if err != nil {
        return fmt.Errorf("error reading response: %v", err)
    }

    fmt.Println(string(body))
    return nil
}
```

## Flag Automation and Workflow Integration for Go Apps

An advanced use case for using feature flags at scale is automating them as part of your development workflow.

It's common for teams to have a development phase, then QA/testing, and then a production release. Our [Unleash Jira plugin](https://docs.getunleash.io/reference/integrations/jira-cloud-plugin-installation) can connect to your Jira server or cloud to create feature flags automatically during the project phases.

As your code progresses through development and Jira tickets are updated, the relevant flag can turn on in a development environment. The next stage could be Canary deployments for testing with certain groups, like a QA team or beta users. The flag could be automatically turned on in QA and/or rolled out to target audiences in production.

Here's how this can be done via our API:

1. Enable a flag.

```go
url := fmt.Sprintf("%s/api/admin/projects/%s/features/%s/environments/%s/on", 
    unleashURL, projectID, featureName, environment)

req, err := http.NewRequest("POST", url, nil)
if err != nil {
    return fmt.Errorf("error creating request: %v", err)
}

req.Header.Add("Accept", "application/json")
req.Header.Add("Authorization", apiKey)

client := &http.Client{}
resp, err := client.Do(req)
if err != nil {
    return fmt.Errorf("error making request: %v", err)
}
defer resp.Body.Close()
```

Review our [API docs on flag enablement](/reference/api/unleash/toggle-feature-environment-on).

2. Update a flag.

```go
url := fmt.Sprintf("%s/api/admin/projects/%s/features/%s", 
    unleashURL, projectID, featureName)

payload := FeatureUpdate{
    Description:     "Controls disabling of the comments section in case of an incident",
    Type:           "kill-switch",
    Stale:          true,
    Archived:       true,
    ImpressionData: false,
}

jsonPayload, err := json.Marshal(payload)
if err != nil {
    return fmt.Errorf("error marshaling payload: %v", err)
}

req, err := http.NewRequest("PUT", url, bytes.NewBuffer(jsonPayload))
req.Header.Add("Accept", "application/json")
req.Header.Add("Authorization", apiKey)
req.Header.Add("Content-Type", "application/json")
```

Review our [API docs on updating feature flags](/reference/api/unleash/update-feature).

3. Archive a flag.

```go
url := fmt.Sprintf("%s/api/admin/projects/%s/features/%s", 
    unleashURL, projectID, featureName)

req, err := http.NewRequest("DELETE", url, nil)
if err != nil {
    return fmt.Errorf("error creating request: %v", err)
}

req.Header.Add("Authorization", apiKey)

client := &http.Client{}
resp, err := client.Do(req)
```

Review [API docs on archiving flags](/reference/api/unleash/archive-feature).

Learn more about different use cases in our [Go SDK documentation](/reference/sdks/go).