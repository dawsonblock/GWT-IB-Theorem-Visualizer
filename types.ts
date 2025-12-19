export enum ViewState {
  THEORY = 'THEORY',
  DIAGRAMS = 'DIAGRAMS',
  SIMULATION = 'SIMULATION',
  ABLATION = 'ABLATION',
  MONITORING = 'MONITORING',
  FEATURE_STORE = 'FEATURE_STORE'
}

export interface CurriculumStep {
  step: number;
  corruptionProb: number;
  ppoKL: number;
  robustnessDrop: number;
  gateActivation: number;
  ppoRatio: number;
}

export interface DiagramProps {
  active?: boolean;
}