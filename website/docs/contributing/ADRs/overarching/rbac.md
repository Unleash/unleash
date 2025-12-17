# ADR-XXX: Generic Permission Model for RBAC, Project Roles, and Collaboration Modes

**Status:** Proposed
**Date:** 2025-12-05
**Owner:** TBD

---

## 1. Context

Unleash provides role-based access control (RBAC) at two layers:

* **Root level** – permissions on instance-wide resources (users, groups, strategies, segments, instance logs, global tokens, etc.).
* **Project level** – permissions on project-scoped resources (feature flags, variants, project tokens, change requests, project settings, etc.).

Additionally, each project has a **Collaboration Mode** (`open`, `protected`, `private`) that controls project visibility and who may submit change requests.

Current behavior is well-described in external documentation, but internally we lack a unified abstraction that explains:

1. How permissions are defined and evaluated for any `(subject, resource, action)` tuple.
2. How root-level and project-level role assignments contribute to effective permissions.
3. How collaboration mode constrains access beyond RBAC.
4. How the **least permission principle** governs the system: **access is always denied unless explicitly granted.**

This ADR proposes a generic model to guide future implementation, documentation, and permission expansion.

---

## 2. Decision

We adopt a formal permission model with these components:

* **Subject** – a user, service account, or group (flattened to users for evaluation).
* **Resource** – an entity classified by `resourceName` and optionally scoped to a `projectId` and/or `environment`.
* **Action** – an operation (e.g., `read`, `create`, `update`, `delete`,  `submit_change_request`).
* **Permission** – a tuple `(resourceName, scope, action)`.

- **Role** – a named set of permissions (scope-agnostic). A role may contain permissions with any combination of scopes (root, project, environment).
- **Role Assignment** – binding a role to a subject with an **assignment scope**:

  * **Instance-level assignment** ("root") – role applies across the instance.
  * **Project-scoped assignment** – role applies only within a given project.
- **Collaboration Mode Constraint** – an additional rule layer controlling project visibility and who may submit change requests.

Effective permission evaluation is based on the union of all explicitly granted permissions from root roles and project roles, constrained by collaboration mode.

There are **no deny rules**. The default is "deny" per the least permission principle.

---

## 3. Core Concepts

### 3.1 Subject

A **subject** is any principal we authorize:

* Human user
* Service account
* Group (resolved to its member users during evaluation)

A subject can hold:

* Direct root-role assignments
* Direct project-role assignments
* Group-based assignments

Effective roles are the **union** of all roles associated with the subject.

### 3.2 Scope

`scope` defines **where** a permission applies. We support three scopes:

* **Root** – grants access across all projects the subject is allowed to view (per collaboration mode). This is a global scope.
* **Project** – grants access only within a specific project, bound through a project-role assignment.
* **Environment** – grants access within a project and a specific environment.

A permission may effectively apply to multiple projects (e.g., a user is a Member in several projects), but this is modeled as **multiple project-role assignments**, *not* a separate multi-project scope. The scope model remains strictly: Root, Project, Environment.

### 3.3 Resource

Resources have:

* `resourceName` – logical type (e.g., `project`, `feature`, `strategy`, `segment`, `api_token`, `change_request`, `user`, etc.).
* `scope` – `root`, `project`, or `environment`.
* Optional identifiers (e.g., `projectId`, `environment`) that further define scoping.

**Instance-wide vs project-scoped access**
Even resources typically considered *instance-wide* (e.g., users, groups) may participate in **project-scoped permission evaluation**. A resource may thus:

* Support **root-level permissions** → granting access across all projects the subject can view.
* Support **project-scoped permissions** → granting access *only to the subset of that resource bound to a specific project*.

Example (genericized): a subject with a `read(resource)` permission scoped to `projectA` may only read the subset of that resource that is accessible within `projectA`. A root-scoped `read(resource)` permission would allow reading the full instance-wide set, subject to collaboration-mode project visibility.

### 3.4 Action

Actions represent operations we check authorization for (e.g., `read`, `create`, `update`, `delete`, `enable`, `disable`, `submit_change_request`).

Authorization checks always reference `(resourceName, scope, action)`.

### 3.5 Permission

A **permission** grants an action on resources matching the `(resourceName, scope)` pattern.

Permissions can be bound at two levels:

* **Root-level permission:** applies across all projects the subject is allowed to see (per collaboration mode). This effectively provides a global view of the resource.
* **Project-scoped / environment-scoped permission:** applies only to resources *as they relate to a specific project* (and optionally environment). This narrows access to the portion of the resource visible within that project.

The same permission **may be defined in both forms**, with different scopes, producing different effective behaviors.

Permissions only ever **grant** access. Absence of permission = denied (least permission principle).

### 3.6 Role

A **role** is a named collection of permission templates.

* Roles themselves are **scope-agnostic**: they can contain permissions with root, project, and environment scopes.
* In practice, some roles are *intended* for instance-level use (e.g., Admin, Editor, Viewer) while others are *intended* for project-level assignments (e.g., Owner, Member), but this intent comes from **how we assign** the role and which permissions it includes—not from a different role type in the model.

**Special handling:**

* Admin has full access (superuser).
* Editor gains implicit project-owner rights on projects they create.

### 3.7 Role Assignments

Assignments attach roles to subjects with an assignment scope:

* **InstanceRoleAssignment(subject, role)** – role is granted at the instance level; all permissions in the role apply within their defined scopes (root, project, environment), constrained by collaboration mode.
* **ProjectRoleAssignment(subject, role, projectId)** – role is granted only for a specific project; only project- and environment-scoped permissions in the role apply, and only within that project.

Multiple role assignments (instance + multiple projects) combine via **permission union**.

Assignments attach roles to subjects:

* `RootRoleAssignment(subject, role)` – applied globally.
* `ProjectRoleAssignment(subject, role, projectId)` – applied only within a project.

Multiple project roles for the same project combine via **permission union**.

---

## 4. Permission Evaluation

### 4.1 Inputs

Evaluation uses:

* subject
* resource (resourceName + scope)
* action
* collaboration mode of the associated project

### 4.2 Evaluation Logic (simplified)

1. If subject is root admin → **ALLOW**.
2. Gather effective root roles and project roles.
3. Build the union of:

   * root-role permissions
   * project-role permissions (for that project)
4. Apply collaboration mode constraints:

   * If subject cannot view the project → **DENY**.
   * If action involves submitting a change request but collaboration mode disallows it → **DENY**.
5. If any permission explicitly grants the action on that resource → **ALLOW**.
6. Otherwise → **DENY** (least permission principle).

Project roles never remove root permissions; they only add capabilities.

---

## 5. Collaboration Modes

Collaboration modes add constraints separate from permissions.

### 5.1 Visibility

* **Open:** All users may view.
* **Protected:** All users may view.
* **Private:** Only project members, owners, Admins, Editors, and users with direct custom root roles may view.

### 5.2 Submitting Change Requests

* **Open:** All users.
* **Protected:** Only project roles (Members, Owners, equivalents).
* **Private:** Same as protected.

If visibility is denied, all project resources are effectively inaccessible.

---

## 6. Relationship Between Instance-Level and Project-Scoped Permissions

* **Permissions**, not roles, carry the authoritative scope (`root`, `project`, `environment`).
* Roles are reusable bundles of permissions; their effective behavior depends on **where** they are assigned:

  * An instance-level assignment exposes root-scoped permissions globally, and project-/environment-scoped permissions across all projects the subject can see.
  * A project-scoped assignment exposes only the project-/environment-scoped permissions, and only for that project.
* Some resources (including traditionally "instance-wide" resources) may expose both root-level and project-level permission variants.

  * Root-level permission → global view across all visible projects.
  * Project-level permission → restricted view to the subset associated with the assigned project.
* Collaboration mode determines baseline project visibility that any permission operates on.
* Final permission set is the union of permissions from all assignments (instance-level + project-scoped), constrained by collaboration mode.
* Project-scoped assignments never remove capabilities granted by instance-level assignments; absence of a permission at both levels implies deny.

---

## 7. Consequences

### Benefits

* Clear internal abstraction for implementing and reasoning about RBAC behavior.
* Stable vocabulary for defining permissions and future enhancements.
* Predictable merging of roles via union semantics.
* Least-permission model enforced by design.

### Trade-offs

* Slightly more conceptual overhead when modifying authorization logic.
* Special-case logic still required for Admin, Editor implicit ownership, and private-project visibility.

---

## 8. Status

Pending team review.

