# ADR-XXX: Generic Permission Model for RBAC, Project Roles, and Collaboration Modes

**Status:** Proposed
**Date:** 2025-12-05
**Owner:** TBD

---

## 1. Context

Unleash provides role-based access control (RBAC) at two layers:

* **Root level** – permissions on instance-wide resources (users, groups, strategies, segments, instance logs, global tokens, etc.).
* **Project level** – permissions on project-related resources (feature flags, variants, project tokens, change requests, project settings, etc.).

Additionally, each project has a **Collaboration Mode** (`open`, `protected`, `private`) that controls project visibility and who may submit change requests.

Current behavior is well-described in external documentation, but internally we lack a unified abstraction that explains:

1. How permissions are defined and evaluated for any `(subject, resource, action)` tuple.
2. How root-level and project-level role assignments contribute to effective permissions.
3. How collaboration mode constrains access beyond RBAC.
4. How the **least permission principle** governs the system: **access is always denied unless explicitly granted.**

We also want a model that is easier to reason about and evolve over time, so future permission changes are simpler, less ambiguous, and clearer to users.

This ADR proposes a generic model to guide future implementation, documentation, and permission expansion.

---

## 2. Decision

We adopt a formal permission model with these components:

* **Subject** – a user, service account, or group (flattened to users for evaluation).
* **Resource** – an entity identified by its `resourceName`. Any project/environment restrictions come from role assignments (via qualifiers), not from the resource itself.
* **Action** – an operation (e.g., `read`, `create`, `update`, `delete`,  `submit_change_request`).
* **Permission** – a tuple `(resourceName, action)`; the permission inherits its `resourceScope` from the resource definition.
* **Resource scope** – the level at which a resource exists (`root`, `project`, `environment`); qualifiers on assignments are interpreted based on this scope.

- **Role** – a named set of permissions (permission-level agnostic). A role may contain permissions with any combination of levels (root, project, environment).
- **Role Assignment** – binding a role to a subject, optionally scoped by qualifiers.
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
* Direct project-level role assignments
* Group-based assignments

Effective roles are the **union** of all roles associated with the subject.

### 3.2 Resource scope

`resourceScope` defines the **level at which a resource exists** and how qualifiers are interpreted. We support three levels:

* **Root** – the resource exists at the instance level. Project/environment qualifiers are ignored.
* **Project** – the resource exists within a project context. A missing `projectId` qualifier means “all accessible projects.”
* **Environment** – the resource exists within a project+environment context. Qualifiers are interpreted from most specific to least specific: `(projectId, environment)` → `projectId` only → no qualifier (all accessible projects/environments).

A permission may effectively apply to multiple projects (e.g., a user is a Member in several projects), but this is modeled as **multiple project-level role assignments**, *not* a separate multi-project level. The level model remains strictly: Root, Project, Environment.

**Important:** `resourceScope` is intrinsic to the resource definition (root/project/environment). **Qualifiers** like `projectId` and `environment` are not part of the permission itself; they belong to the **assignment** of that permission to a subject.

### 3.3 Resource

Resources have:

* `resourceName` – logical type (e.g., `project`, `feature`, `strategy`, `segment`, `api_token`, `change_request`, `user`, etc.).
* `resourceScope` – `root`, `project`, or `environment` (defines how qualifiers are interpreted for this resource).

**Instance-wide vs project-scoped access**
Even resources typically considered *instance-wide* (e.g., users, groups) may participate in **project-level permission evaluation** based on assignment qualifiers. A resource may thus:

* Support **root-level permissions** → granting access across all projects the subject can view.
* Support **project-level permissions** → granting access *only to the subset of that resource bound to a specific project via assignment qualifiers*.

Example (genericized): a subject with a `read(resource)` permission applied to `projectA` may only read the subset of that resource that is accessible within `projectA`. A root-level `read(resource)` permission would allow reading the full instance-wide set, subject to collaboration-mode project visibility.

### 3.4 Action

Actions represent operations we check authorization for (e.g., `read`, `create`, `update`, `delete`, `enable`, `disable`, `submit_change_request`).

Authorization checks evaluate `(resourceName, action)` against the subject’s assigned permissions and assignment qualifiers; `resourceScope` determines how qualifiers are interpreted.

### 3.5 Permission

A **permission** grants an action on resources identified by `resourceName`, with the resource’s `resourceScope` constraining how qualifiers are applied.

Permissions can be bound at two levels:

* **Root-level permission:** applies across all projects the subject is allowed to see (per collaboration mode). This effectively provides a global view of the resource.
* **Project-level / environment-level permission:** applies only to resources *as they relate to a specific project* (and optionally environment) via assignment qualifiers. This narrows access to the portion of the resource visible within that project.

The same permission **may be defined in both forms**, with different levels, producing different effective behaviors.

**Assignment qualifiers:** when a permission is granted to a subject, the assignment may include `projectId` and/or `environment` qualifiers that restrict *where* the permission applies. The permission object itself does **not** carry these qualifiers.

Permissions only ever **grant** access. Absence of permission = denied (least permission principle).

### 3.6 Role

A **role** is a named collection of permission templates.

* Roles themselves are **permission-level agnostic**: they can contain permissions with root, project, and environment levels.
* In practice, some roles are *intended* for instance-level use (e.g., Admin, Editor, Viewer) while others are *intended* for project-level assignments (e.g., Owner, Member), but this intent comes from **how we assign** the role and which permissions it includes—not from a different role type in the model.

**Special handling:**

* Admin has full access (superuser).
* Editor gains implicit project-owner rights on projects they create.

### 3.7 Role Assignments

Assignments attach roles to subjects, with optional qualifiers that narrow reach.

* **RoleAssignment(subject, role, qualifiers?)** – one generic form; the presence of qualifiers narrows the assignment.

Multiple role assignments (instance + multiple projects) combine via **permission union**.

When a permission is assigned, the assignment carries any **qualifiers** (e.g., `projectId`, `environment`). Those qualifiers are not part of the permission definition itself; they are properties of the assignment. Root-level permissions in a role apply globally; project/environment-level permissions are narrowed by qualifiers when present.

**Note:** assignment reach could later support subsets beyond qualifiers (e.g., “all public projects only”). This is not currently supported, but the model should leave room for it.
**Qualifier semantics today:** if no qualifier is provided, the assignment applies to all projects/environments allowed by the permission. Qualifiers may narrow to a specific project, a specific environment across all projects, or a specific `(project, environment)` pair.
**Qualifier extensions (future):** qualifiers could evolve to support multiple projects, multiple environments, multiple `(project, environment)` pairs, name matchers, or other filters like “public projects only.” Keep this in mind, but keep the initial implementation simple.

Assignments attach roles to subjects:

* `RoleAssignment(subject, role, qualifiers?)` – applied within the assignment’s reach (global or qualified) and optionally narrowed by qualifiers.

Multiple project roles for the same project combine via **permission union**.

---

## 4. Permission Evaluation

### 4.1 Inputs

Evaluation uses:

* subject
* resource (resourceName)
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

* **Permissions**, not roles, carry the authoritative permission level (`root`, `project`, `environment`).
* Roles are reusable bundles of permissions; their effective behavior depends on **where** they are assigned:

  * An instance-level assignment exposes root-level permissions globally, and project-/environment-level permissions across all projects the subject can see.
  * A project-level assignment exposes only the project-/environment-level permissions, and only for that project.
  * If a role contains both root-level and project-level permissions, a root-level assignment applies both; a project-level assignment applies only the project-/environment-level subset.
* Some resources (including traditionally "instance-wide" resources) may expose both root-level and project-level permission variants.

  * Root-level permission → global view across all visible projects.
  * Project-level permission → restricted view to the subset associated with the assigned project.
* Collaboration mode determines baseline project visibility that any permission operates on.
* Final permission set is the union of permissions from all assignments (instance-level + project-level), constrained by collaboration mode.
* Project-level assignments never remove capabilities granted by instance-level assignments; absence of a permission at both levels implies deny.

---

## 7. Consequences

### Benefits

* Clear internal abstraction for implementing and reasoning about RBAC behavior.
* Stable vocabulary for defining permissions and future enhancements.
* Predictable merging of roles via union semantics.
* Least-permission model enforced by design.
* Simpler long-term mental model for users and maintainers through consistent assignment semantics.
* More explicit upgrade path for future permission refinements without breaking legacy contracts.

### Trade-offs

* Slightly more conceptual overhead when modifying authorization logic.
* Special-case logic still required for Admin, Editor implicit ownership, and private-project visibility.

---

## 8. Status

Pending team review.
