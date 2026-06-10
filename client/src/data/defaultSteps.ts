import type { WorkflowStep } from "../types";
import topicEvaluationPrompt from "@knowledge/01_TOPIC_EVALUATION/01_PROMPT.md?raw";
import scriptCreationPrompt from "@knowledge/02_SCRIPT_CREATION/01_PROMPT.md?raw";
import auditAndFinalizePrompt from "@knowledge/03_AUDIT_AND_FINALIZE/01_PROMPT.md?raw";
import editorBriefPrompt from "@knowledge/04_EDITOR_BRIEF/01_PROMPT.md?raw";

type StepDefinition = Pick<
  WorkflowStep,
  "id" | "stepNumber" | "name" | "description" | "promptTemplate"
>;

export const stepDefinitions: StepDefinition[] = [
  {
    id: "01_TOPIC_EVALUATION",
    stepNumber: "01",
    name: "Topic Evaluation",
    description:
      "Evaluate a raw idea and either pass it, reject it, delay it, or generate a Stage-2-ready AI reframe.",
    promptTemplate: topicEvaluationPrompt,
  },
  {
    id: "02_SCRIPT_CREATION",
    stepNumber: "02",
    name: "Script Creation",
    description:
      "Turn a MAKE-NOW or AI-reframed topic package into a complete first script draft with structure, hook, payoff, and production notes.",
    promptTemplate: scriptCreationPrompt,
  },
  {
    id: "03_AUDIT_AND_FINALIZE",
    stepNumber: "03",
    name: "Audit & Finalize",
    description:
      "Audit the first script draft and produce the final production-ready version in a single pass. Part A locks the audit; Part B rewrites only what is needed and outputs Status: PRODUCTION-READY.",
    promptTemplate: auditAndFinalizePrompt,
  },
  {
    id: "04_EDITOR_BRIEF",
    stepNumber: "04",
    name: "Editor Brief",
    description:
      "Convert the Stage 3 production-ready final script into a complete editor and producer handoff.",
    promptTemplate: editorBriefPrompt,
  },
];
