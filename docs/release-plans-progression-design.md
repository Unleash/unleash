# Release Plans Progression Mechanism Design Document

## Executive Summary

This document outlines the design for enhancing the Release Plans feature to support flexible progression mechanisms, evolving from simple time-based triggers to sophisticated metric-driven automation. The system will support impact metrics as triggers for milestone progression while maintaining extensibility for future enhancement types.

## Context

Release plans in Unleash provide a structured way to progressively roll out features through milestones. Currently, the UI shows:
- Multiple milestones (e.g., "specific users", "20% of all users", "100% of all users")
- Manual "Start" buttons for each milestone
- Basic time-based automation ("Proceed after X Hours")
- Environment-specific release plans (Development, Production)

## Vision

We envision a future where release plan progression can be driven by:
- **Impact metrics triggers** to move between milestones
- **Impact metrics triggers** to move from the last milestone to a completed state
- **Safeguards** that stop automation based on impact metrics
- **Combination of triggers** to move between milestones

## Current State Analysis

### Existing Components

1. **Release Plan Structure** (`/src/lib/features/release-plans/`)
   - `ReleasePlan`: Core entity with milestones
   - `ReleasePlanMilestone`: Sequential stages with strategies
   - `ReleasePlanTemplate`: Reusable plan configurations
   - Events: `RELEASE_PLAN_MILESTONE_STARTED` for transitions

2. **Impact Metrics Module** (`/src/lib/features/metrics/impact/`)
   - `MetricsTranslator`: Prometheus integration
   - `define-impact-metrics`: Counter and gauge definitions
   - Existing metrics: error counts, request counts, memory usage

3. **Infrastructure**
   - `SchedulerService`: Available for periodic tasks
   - Event-driven architecture with EventEmitter
   - Robust event system for state changes

### Current UI Flow
- Milestones display with percentage rollouts
- "Add automation" button between milestones
- Manual progression via "Start" buttons
- Time-based automation only ("Proceed after X Hours")

## Proposed Architecture

### Core Design Principles

1. **Progressive Enhancement**: Start with time-based, evolve to metrics-based
2. **Fail-Safe Defaults**: Manual override always available
3. **Observability First**: Every decision must be auditable
4. **Template-Level Configuration**: Safeguards apply to entire release plan

### System Components

#### 1. Trigger Abstraction Layer

```typescript
// Base trigger interface
interface IReleasePlanTrigger {
  id: string;
  type: 'time' | 'impact-metric' | 'composite';
  name: string;
  description?: string;

  evaluate(context: EvaluationContext): Promise<TriggerResult>;
  validate(): ValidationResult;
}

// Evaluation context passed to triggers
interface EvaluationContext {
  releasePlan: ReleasePlan;
  currentMilestone: ReleasePlanMilestone;
  targetMilestone: ReleasePlanMilestone;
  environment: string;
  featureName: string;
  metrics?: MetricsSnapshot;
}

// Result of trigger evaluation
interface TriggerResult {
  triggered: boolean;
  reason: string;
  metadata?: Record<string, any>;
  nextEvaluationTime?: Date;
}
```

#### 2. Trigger Types

##### Time-Based Triggers (Current Implementation)
```typescript
interface TimeTrigger extends IReleasePlanTrigger {
  type: 'time';
  duration: number; // milliseconds
  startedAt?: Date;
}
```

##### Impact Metric Triggers (New)
```typescript
interface ImpactMetricTrigger extends IReleasePlanTrigger {
  type: 'impact-metric';
  metricName: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'delta';
  threshold: number;
  aggregation: {
    window: '5m' | '1h' | '6h' | '24h' | '7d';
    function: 'avg' | 'sum' | 'max' | 'min' | 'p95' | 'p99';
  };
  // For delta comparisons
  baselineWindow?: string;
  improvementRequired?: number; // percentage
}
```

##### Composite Triggers (Future)
```typescript
interface CompositeTrigger extends IReleasePlanTrigger {
  type: 'composite';
  operator: 'AND' | 'OR';
  triggers: IReleasePlanTrigger[];
}
```

#### 3. Safeguard System

Safeguards are defined at the **release plan template level** and apply to all milestones:

```typescript
interface ReleasePlanSafeguard {
  id: string;
  name: string;
  enabled: boolean;
  conditions: SafeguardCondition[];
  action: 'halt' | 'alert' | 'rollback';
  severity: 'warning' | 'critical';
}

interface SafeguardCondition {
  metricName: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte';
  threshold: number;
  duration: string; // How long condition must be true
  aggregation: AggregationConfig;
}
```

### Data Model Updates

#### Enhanced Release Plan Template
```typescript
interface ReleasePlanTemplate {
  id: string;
  discriminator: 'template';
  name: string;
  description?: string | null;
  createdByUserId: number;
  createdAt: string;
  milestones?: ReleasePlanMilestone[];
  archivedAt?: string;

  // New fields
  safeguards?: ReleasePlanSafeguard[];  // Template-level safeguards
  defaultAutomationEnabled?: boolean;
}
```

#### Enhanced Release Plan Milestone
```typescript
interface ReleasePlanMilestone {
  id: string;
  name: string;
  sortOrder: number;
  releasePlanDefinitionId: string;
  strategies?: ReleasePlanMilestoneStrategy[];

  // New fields for automation
  progressionTrigger?: IReleasePlanTrigger;  // Single trigger per transition
  automationEnabled?: boolean;
}
```

#### Milestone Transitions (UI Concept)
```typescript
interface MilestoneTransition {
  fromMilestoneId: string;
  toMilestoneId: string;
  trigger?: IReleasePlanTrigger;
  // Positioned in UI between milestones
}
```

### Service Architecture

#### 1. Release Plan Progression Service
**Location**: `/src/lib/features/release-plans/services/release-plan-progression-service.ts`

**Responsibilities**:
- Orchestrate trigger evaluations
- Execute milestone transitions
- Apply safeguard checks
- Maintain progression history
- Handle rollback scenarios

```typescript
class ReleasePlanProgressionService {
  async evaluateProgression(planId: string): Promise<ProgressionResult>;
  async transitionToMilestone(planId: string, milestoneId: string): Promise<void>;
  async checkSafeguards(plan: ReleasePlan): Promise<SafeguardResult>;
  async rollbackMilestone(planId: string, reason: string): Promise<void>;
}
```

#### 2. Impact Metrics Evaluator
**Location**: `/src/lib/features/release-plans/services/impact-metrics-evaluator.ts`

**Responsibilities**:
- Query metrics from impact metrics system
- Aggregate metrics over time windows
- Calculate baselines and deltas
- Cache metric results

```typescript
class ImpactMetricsEvaluator {
  async getMetricValue(
    metricName: string,
    aggregation: AggregationConfig,
    context: EvaluationContext
  ): Promise<number>;

  async compareWithBaseline(
    metricName: string,
    currentWindow: string,
    baselineWindow: string
  ): Promise<DeltaComparison>;

  async getMetricTrend(
    metricName: string,
    duration: string,
    points: number
  ): Promise<TrendData>;
}
```

#### 3. Progression Scheduler
**Location**: `/src/lib/features/release-plans/services/progression-scheduler.ts`

**Integration with existing SchedulerService**:
```typescript
class ProgressionScheduler {
  private scheduler: SchedulerService;

  async scheduleProgressionChecks(plan: ReleasePlan): Promise<void>;
  async cancelProgressionChecks(planId: string): Promise<void>;
  async getNextEvaluationTime(plan: ReleasePlan): Promise<Date | null>;
}
```

### Database Schema

#### Modified Tables

**release_plan_templates** (add columns)
```sql
ALTER TABLE release_plan_templates ADD COLUMN safeguards JSONB;
ALTER TABLE release_plan_templates ADD COLUMN default_automation_enabled BOOLEAN DEFAULT false;
```

**release_plan_milestones** (add columns)
```sql
ALTER TABLE release_plan_milestones ADD COLUMN progression_trigger JSONB;
ALTER TABLE release_plan_milestones ADD COLUMN automation_enabled BOOLEAN DEFAULT false;
```

#### New Tables

**release_plan_progression_history**
```sql
CREATE TABLE release_plan_progression_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_plan_id UUID NOT NULL REFERENCES release_plans(id),
  from_milestone_id UUID REFERENCES release_plan_milestones(id),
  to_milestone_id UUID NOT NULL REFERENCES release_plan_milestones(id),
  trigger_type VARCHAR(50) NOT NULL,
  trigger_result JSONB NOT NULL,
  metrics_snapshot JSONB,
  safeguard_status JSONB,
  transitioned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  transitioned_by VARCHAR(50) NOT NULL, -- 'automated' or user_id
  environment VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_progression_history_plan ON release_plan_progression_history(release_plan_id);
CREATE INDEX idx_progression_history_time ON release_plan_progression_history(transitioned_at);
```

**release_plan_safeguard_events**
```sql
CREATE TABLE release_plan_safeguard_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_plan_id UUID NOT NULL REFERENCES release_plans(id),
  safeguard_id VARCHAR(255) NOT NULL,
  safeguard_name VARCHAR(255) NOT NULL,
  triggered_at TIMESTAMP NOT NULL DEFAULT NOW(),
  condition_details JSONB NOT NULL,
  metric_values JSONB NOT NULL,
  action_taken VARCHAR(50) NOT NULL,
  resolved_at TIMESTAMP,
  resolved_by VARCHAR(255)
);

CREATE INDEX idx_safeguard_events_plan ON release_plan_safeguard_events(release_plan_id);
CREATE INDEX idx_safeguard_events_time ON release_plan_safeguard_events(triggered_at);
```

### Event System Extensions

New events to support progression:

```typescript
// Progression events
export const RELEASE_PLAN_PROGRESSION_EVALUATED = 'release-plan-progression-evaluated';
export const RELEASE_PLAN_PROGRESSION_TRIGGERED = 'release-plan-progression-triggered';
export const RELEASE_PLAN_PROGRESSION_FAILED = 'release-plan-progression-failed';

// Safeguard events
export const RELEASE_PLAN_SAFEGUARD_TRIGGERED = 'release-plan-safeguard-triggered';
export const RELEASE_PLAN_SAFEGUARD_RESOLVED = 'release-plan-safeguard-resolved';

// Metric events
export const RELEASE_PLAN_METRIC_THRESHOLD_MET = 'release-plan-metric-threshold-met';
export const RELEASE_PLAN_METRIC_BASELINE_ESTABLISHED = 'release-plan-metric-baseline-established';
```

### API Endpoints

#### Progression Management
```
GET    /api/admin/projects/{projectId}/features/{featureName}/release-plans/{planId}/progression-status
POST   /api/admin/projects/{projectId}/features/{featureName}/release-plans/{planId}/evaluate-progression
POST   /api/admin/projects/{projectId}/features/{featureName}/release-plans/{planId}/override-progression
GET    /api/admin/projects/{projectId}/features/{featureName}/release-plans/{planId}/progression-history
```

#### Trigger Configuration
```
PUT    /api/admin/release-plan-templates/{templateId}/milestones/{milestoneId}/trigger
DELETE /api/admin/release-plan-templates/{templateId}/milestones/{milestoneId}/trigger
POST   /api/admin/release-plan-templates/{templateId}/milestones/{milestoneId}/trigger/validate
```

#### Safeguard Management
```
GET    /api/admin/release-plan-templates/{templateId}/safeguards
POST   /api/admin/release-plan-templates/{templateId}/safeguards
PUT    /api/admin/release-plan-templates/{templateId}/safeguards/{safeguardId}
DELETE /api/admin/release-plan-templates/{templateId}/safeguards/{safeguardId}
GET    /api/admin/projects/{projectId}/features/{featureName}/release-plans/{planId}/safeguard-status
```

#### Metrics Endpoints
```
GET /api/admin/projects/{projectId}/features/{featureName}/release-plans/{planId}/metrics
GET /api/admin/projects/{projectId}/features/{featureName}/release-plans/{planId}/metrics/{metricName}/history
GET /api/admin/metrics/available-for-triggers
```

### UI Components

#### 1. Automation Configuration (Between Milestones)
- Replaces current "Add automation" button
- Dropdown with trigger types:
  - Time-based (current)
  - Error rate threshold
  - Success rate threshold
  - Custom metric threshold
  - Composite conditions (future)

#### 2. Safeguard Configuration (Template Level)
- New section in Release Plan Template editor
- List of safeguard conditions
- Visual indicators when safeguards are active
- Override controls for administrators

#### 3. Progression Monitoring Dashboard
- Real-time progression status
- Metric visualizations
- Safeguard status indicators
- Historical progression timeline
- Manual intervention controls

## Implementation Phases

### Phase 1: Foundation (Sprint 1)
- [ ] Create trigger abstraction interfaces
- [ ] Implement time-based triggers (refactor existing)
- [ ] Build progression service skeleton
- [ ] Add database migrations for new fields

### Phase 2: Impact Metrics Integration (Sprint 2)
- [ ] Implement impact metrics evaluator
- [ ] Create metric-based triggers for error rates
- [ ] Add metric aggregation capabilities
- [ ] Build metric history storage

### Phase 3: Safeguards (Sprint 3)
- [ ] Implement safeguard system at template level
- [ ] Add safeguard evaluation logic
- [ ] Create safeguard event tracking
- [ ] Build alert mechanisms

### Phase 4: Automation Engine (Sprint 4)
- [ ] Integrate with SchedulerService
- [ ] Implement progression evaluation loop
- [ ] Add rollback capabilities
- [ ] Create audit trail

### Phase 5: API & Backend (Sprint 5)
- [ ] Implement all REST endpoints
- [ ] Add OpenAPI specifications
- [ ] Create webhook notifications
- [ ] Build admin override capabilities

### Phase 6: UI Implementation (Sprint 6)
- [ ] Update "Add automation" UI with new trigger types
- [ ] Build safeguard configuration UI
- [ ] Create progression monitoring dashboard
- [ ] Add visual feedback for automation status

## Example Configurations

### Example 1: Error Rate Safeguard
```json
{
  "id": "safeguard-1",
  "name": "High Error Rate Protection",
  "enabled": true,
  "conditions": [{
    "metricName": "client_error_rate",
    "operator": "gt",
    "threshold": 5.0,
    "duration": "5m",
    "aggregation": {
      "window": "5m",
      "function": "avg"
    }
  }],
  "action": "halt",
  "severity": "critical"
}
```

### Example 2: Success Rate Trigger
```json
{
  "id": "trigger-1",
  "type": "impact-metric",
  "name": "95% Success Rate",
  "metricName": "request_success_rate",
  "operator": "gte",
  "threshold": 95.0,
  "aggregation": {
    "window": "1h",
    "function": "avg"
  }
}
```

### Example 3: Time + Metrics Composite (Future)
```json
{
  "id": "trigger-2",
  "type": "composite",
  "name": "1 hour AND low errors",
  "operator": "AND",
  "triggers": [
    {
      "type": "time",
      "duration": 3600000
    },
    {
      "type": "impact-metric",
      "metricName": "error_rate",
      "operator": "lt",
      "threshold": 1.0,
      "aggregation": {
        "window": "30m",
        "function": "avg"
      }
    }
  ]
}
```

## Security Considerations

1. **Authorization**
   - Trigger configuration requires `UPDATE_FEATURE_ENVIRONMENT` permission
   - Safeguard override requires admin role
   - Progression history viewable with `READ_FEATURE` permission

2. **Validation**
   - All metric thresholds validated for reasonable ranges
   - Time durations have min/max limits
   - Safeguard conditions verified before activation

3. **Audit Trail**
   - All automated progressions logged with full context
   - Manual overrides tracked with user and reason
   - Safeguard events retained for compliance

## Performance Considerations

1. **Metric Aggregation**
   - Cache aggregated metrics with 1-minute TTL
   - Use materialized views for common aggregations
   - Batch multiple metric queries

2. **Evaluation Scheduling**
   - Stagger evaluations to prevent thundering herd
   - Use exponential backoff for failed evaluations
   - Limit concurrent evaluations per instance

3. **Database Optimization**
   - Index all foreign keys and timestamp columns
   - Partition progression_history by month
   - Archive old progression data after 90 days

## Monitoring & Observability

### Metrics to Track
- Progression evaluation latency
- Trigger evaluation success/failure rates
- Safeguard activation frequency
- Manual override usage
- Metric query performance

### Dashboards
- Release plan progression overview
- Safeguard activation heatmap
- Metric trends per feature
- Automation effectiveness metrics

### Alerts
- Safeguard triggered on production release
- Progression evaluation failures
- Metric collection gaps
- High manual override rate

## Migration Strategy

1. **Backward Compatibility**
   - Existing time-based automations continue working
   - No changes required for manual progressions
   - Gradual UI updates with feature flags

2. **Rollout Plan**
   - Enable for internal testing first
   - Beta release to selected customers
   - Gradual rollout with monitoring
   - Full release after stability confirmed

3. **Data Migration**
   - No breaking changes to existing data
   - New fields nullable with defaults
   - Automated migration scripts for templates

## Success Metrics

1. **Adoption Metrics**
   - % of release plans using automation
   - Number of metric-based triggers configured
   - Safeguard configuration rate

2. **Effectiveness Metrics**
   - Reduction in failed deployments
   - Time saved through automation
   - Incident reduction from safeguards

3. **User Satisfaction**
   - User feedback scores
   - Support ticket reduction
   - Feature request patterns

## Future Enhancements

1. **Machine Learning Integration**
   - Anomaly detection for automatic safeguards
   - Predictive progression timing
   - Intelligent threshold recommendations

2. **External Integrations**
   - Webhook triggers from monitoring systems
   - Integration with CI/CD pipelines
   - Custom metric sources via API

3. **Advanced Automation**
   - Multi-environment orchestration
   - Cross-feature dependencies
   - Automated rollback strategies

4. **Enhanced Analytics**
   - Release velocity tracking
   - Risk scoring for progressions
   - A/B testing for automation strategies

## Conclusion

This design provides a robust foundation for evolving release plan progressions from simple time-based automation to sophisticated metric-driven orchestration. By maintaining backward compatibility and focusing on user safety through safeguards, we can deliver powerful automation capabilities while minimizing risk.

The phased implementation approach allows for iterative development and validation, ensuring each component is thoroughly tested before building upon it. The architecture's extensibility ensures we can accommodate future requirements without major refactoring.