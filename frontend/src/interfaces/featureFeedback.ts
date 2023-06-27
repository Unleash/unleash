export interface IFeatureFeedback {
  id: string;
  featureName: string;
  contextHash?: string;
  payload: string;
  metadata: Record<string, any>;
  createdAt: Date;
}
