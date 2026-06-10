export type WorkflowStatus =
  | "not_started"
  | "prompt_generated"
  | "output_added"
  | "completed";

export type WorkflowStepId =
  | "01_TOPIC_EVALUATION"
  | "02_SCRIPT_CREATION"
  | "03_AUDIT_AND_FINALIZE"
  | "04_EDITOR_BRIEF";

export type ProductionChecklist = {
  scriptVerified: boolean;
  shotListVerified: boolean;
  brollVerified: boolean;
  onScreenTextVerified: boolean;
  audioVerified: boolean;
  thumbnailsAndSourcesVerified: boolean;
  passedToProduction: boolean;
};

export type OutputHistoryEntry = {
  prompt:  string;
  output:  string;
  savedAt: string;
};

export type WorkflowStep = {
  id: WorkflowStepId;
  stepNumber: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  input: string;
  promptTemplate: string;
  generatedPrompt: string;
  aiOutput: string;
  stepNotes:     string;
  gaps:          string;
  decision:      string;
  nextAction:    string;
  outputHistory: OutputHistoryEntry[];
};

export type WorkflowSession = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  productionChecklist?: ProductionChecklist;
  productionReadyAt?: string;
  steps: WorkflowStep[];
};

export type BannerMessage = {
  message: string;
  tone: "success" | "error";
};
