---
title: How to define custom context fields
---


## Constrain on custom context fields {#constrain-on-custom-context-fields}

It is also possible to constrain an activation strategy configuration on custom context fields. A common use case is a multi-tenant service where you want to control roll-out on a tenant identifier. This allows you to decide which customer should get access to your new feature.

![Custom constraints](/img/custom-constraints.png)

## Define your own custom fields {#define-your-own-custom-fields}

> Starting with Unleash-enterprise version 3.2.28 customers can define their custom context fields via the user interface.

You can also define your own custom context fields that you can use together with strategy constraints. We have seen customers use multiple variants of custom context fields to control their feature roll-out:

- region
- country
- customerType
- tenantId

Combining strategy constraints with the “flexibleRollout” allows you to do a gradual roll-out to a specific segment of your user base.

#### Step 1: Navigate to “Context Fields“ {#step-1-navigate-to-context-fields}

Locate “context fields in the menu

![Context fields](/img/context-fields.png)

#### Step 2: Define new context field {#step-2-define-new-context-field}

Next you can define your new context field. The minimum requirement is to give it a unique _name_. In addition, you can give it a description and define the legal values.

![New context fields](/img/new_context_field.png)

#### What is “legal values”? {#what-is-legal-values}

Legal values defines all possible values for the context field. this will be used in Unleash Admin UI to guide users when working with context fields to make sure they only use legal values.

![New context fields](/img/constraints_legal_values.png)
