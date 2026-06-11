import { stepDefinitions } from "../data/defaultSteps";
import { knowledgeBaseByStep } from "../data/knowledgeBase";
import type {
  ProductionChecklist,
  WorkflowSession,
  WorkflowStatus,
  WorkflowStep,
  WorkflowStepId,
} from "../types";

type ContractCheck = {
  label: string;
  required: boolean;
  ready: boolean;
};

type OutputContract = {
  terminalPattern?: RegExp;
  requiredSections: string[];
  requiredPatterns?: Array<{
    label: string;
    pattern: RegExp;
  }>;
};

const workflowStatuses: WorkflowStatus[] = [
  "not_started",
  "prompt_generated",
  "output_added",
  "completed",
];

const workflowStepIds = stepDefinitions.map((step) => step.id);

const outputContracts: Record<WorkflowStepId, OutputContract> = {
  "01_TOPIC_EVALUATION": {
    requiredSections: [
      "## 1. Verdict",
      "## 2. 8-Point Gate",
      "## 3. Full Brief",
      "## 4. Risk Check",
      "## 5. Sources Consulted",
      "## 6. AI Reframe Package",
      "## 7. Counter-argument",
      "## 8. Self-Verification",
    ],
    requiredPatterns: [
      { label: "Topic evaluation header", pattern: /^# Topic Evaluation:/im },
      {
        label: "Stage 1 verdict enum",
        pattern: /\*\*(MAKE-NOW|REFRAME|MAKE-LATER|DROP)\*\*/i,
      },
    ],
  },
  "02_SCRIPT_CREATION": {
    terminalPattern: /^Terminal at Stage 2\b/im,
    requiredSections: [
      "## 1. Production Target",
      "## 2. Format Lane",
      "## 3. Final Title",
      "## 4. Thumbnail Text",
      "## 5. Hook / Hook Stack",
      "## 6. Payoff One-liner",
      "## 7. Mental Model / Framework",
      "## 8. Final Spoken Script",
      "## 9. Host Tone",
      "## 10. Editor Notes",
      "## 11. Fact-Check Notes",
      "## 12. Sources Consulted",
      "## 13. Writer's Lock",
      "## 14. External-Creator Clone Risk Check",
      "## 15. Self-Verification",
    ],
    requiredPatterns: [
      { label: "Script header", pattern: /^# Script:/im },
      { label: "Word count", pattern: /\*\*Word count:\*\*/i },
      // KB v4.1 — Writer's Lock check 7: delivery cues are mandatory; [direct] opens every script.
      { label: "Delivery cues embedded ([direct] opener)", pattern: /\[direct\]/i },
    ],
  },
  // Stage 3: audit runs internally, but the app only needs the final script package.
  "03_AUDIT_AND_FINALIZE": {
    terminalPattern: /^Terminal.*Stage 3\b/im,
    requiredSections: [
      "## 1. Production Target",
      "## 2. Format Lane",
      "## 3. Final Title",
      "## 4. Thumbnail Text",
      "## 5. Hook / Hook Stack",
      "## 6. Payoff One-liner",
      "## 7. Mental Model / Framework",
      "## 8. Final Spoken Script",
    ],
    requiredPatterns: [
      { label: "Final Script header", pattern: /^# Final Script:/im },
      {
        label: "Status field (PRODUCTION-READY or NEEDS-ANOTHER-PASS)",
        pattern: /\*Status:\s*(PRODUCTION-READY|NEEDS-ANOTHER-PASS)\*/i,
      },
      // KB v4.1 — cues must survive Stage 3 (preserved verbatim, closer carries [drop voice]).
      { label: "Delivery cues preserved ([direct] present)", pattern: /\[direct\]/i },
    ],
  },
  "04_EDITOR_BRIEF": {
    terminalPattern: /^Terminal at Stage 4\b/im,
    requiredSections: [
      "## 1. Script",
      "## 2. Shot List",
      "## 3. B-Roll Placement Guide",
      "## 4. On-Screen Text",
      "## 5. Audio",
      "## 6. Color & Look",
      "## 7. Thumbnails",
      "## 8. Must-Keep Visual References & Licensing",
      "## 9. References & Sources",
    ],
    requiredPatterns: [
      { label: "Editor brief header", pattern: /^# Editor Brief:/im },
      { label: "Production-ready source", pattern: /Status:\s*PRODUCTION-READY/i },
    ],
  },
};

const nowIso = () => new Date().toISOString();

export const createEmptyProductionChecklist = (): ProductionChecklist => ({
  scriptVerified: false,
  shotListVerified: false,
  brollVerified: false,
  onScreenTextVerified: false,
  audioVerified: false,
  thumbnailsAndSourcesVerified: false,
  passedToProduction: false,
});

export const isProductionChecklistComplete = (
  checklist: ProductionChecklist | undefined
) => {
  const current = { ...createEmptyProductionChecklist(), ...(checklist ?? {}) };
  return Object.values(current).every(Boolean);
};

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `session-${Date.now()}`;
};

const emptyStepFromDefinition = (
  definition: (typeof stepDefinitions)[number]
): WorkflowStep => ({
  id: definition.id,
  stepNumber: definition.stepNumber,
  name: definition.name,
  description: definition.description,
  status: "not_started",
  input: "",
  promptTemplate: definition.promptTemplate,
  generatedPrompt: "",
  aiOutput: "",
  stepNotes:     "",
  gaps:          "",
  decision:      "",
  nextAction:    "",
  outputHistory: [],
});

export const createDefaultSession = (): WorkflowSession => {
  const createdAt = nowIso();

  return refreshSession(
    {
      id: createId(),
      title: "Prompt Workflow",
      createdAt,
      updatedAt: createdAt,
      productionChecklist: createEmptyProductionChecklist(),
      productionReadyAt: "",
      steps: stepDefinitions.map(emptyStepFromDefinition),
    },
    false
  );
};

const buildStepInput = (steps: WorkflowStep[], index: number) => {
  // Auto-fill only uses real saved content — never injects [Missing...] placeholders.
  // Placeholders are added only at prompt-compile time (generatePrompt → outputOrMissing).
  // This ensures a step can always be used independently by pasting input manually.
  switch (index) {
    case 0:
      return steps[0]?.input ?? "";
    case 1:
      // Step 02: input = step 01 output (if available)
      return steps[0]?.aiOutput?.trim() ?? "";
    case 2: {
      // Step 03 (Audit & Finalize): input = step 02 script + optional step 01 brief
      const script = steps[1]?.aiOutput?.trim() ?? "";
      const topicBrief = steps[0]?.aiOutput?.trim() ?? "";
      if (!script) return ""; // nothing useful to auto-fill without the script
      return [
        script,
        topicBrief ? `=== TOPIC-EVAL BRIEF (optional) ===\n${topicBrief}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");
    }
    case 3: {
      // Step 04 (Editor Brief): input = Step 03's production-ready final script.
      // The audit may exist outside the app; Stage 4 treats it as optional.
      const combined = steps[2]?.aiOutput?.trim() ?? "";
      return combined;
    }
    default:
      return "";
  }
};

const fencedBlockWithInfo = (content: string, infoString = "") => {
  const longestBacktickRun = Math.max(
    2,
    ...Array.from(content.matchAll(/`+/g), (match) => match[0].length)
  );
  const fence = "`".repeat(longestBacktickRun + 1);

  return `${fence}${infoString ? infoString : ""}\n${content.trim()}\n${fence}`;
};

const fencedBlock = (content: string) => fencedBlockWithInfo(content);

const replaceFencedBlock = (
  template: string,
  blockNumber: number,
  content: string
) => {
  let currentBlock = 0;

  return template.replace(/```[\s\S]*?```/g, (match) => {
    currentBlock += 1;
    return currentBlock === blockNumber ? fencedBlock(content) : match;
  });
};

const outputOrMissing = (value: string | undefined, label: string) =>
  value?.trim() || `[Missing ${label}]`;

const optionalOutput = (value: string | undefined, label: string) =>
  value?.trim() || `N/A - ${label} not available in this workflow session.`;

const cleanInputPart = (value: string | undefined) => {
  const trimmed = value?.trim() ?? "";

  if (
    /^\[(Missing|PASTE)\b/i.test(trimmed) ||
    /^N\/A - .*not available/i.test(trimmed)
  ) {
    return "";
  }

  return trimmed;
};

const markerMatch = (input: string, marker: RegExp) => {
  const match = input.match(marker);

  return match
    ? {
        start: match.index ?? 0,
        end: (match.index ?? 0) + match[0].length,
      }
    : null;
};

const splitByMarker = (input: string, marker: RegExp) => {
  const match = markerMatch(input, marker);

  if (!match) {
    return { before: input, after: "" };
  }

  return {
    before: input.slice(0, match.start),
    after: input.slice(match.end),
  };
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const hasMarkdownLineStartingWith = (input: string, value: string) =>
  new RegExp(`^${escapeRegExp(value)}(?:\\s|\\(|$)`, "im").test(input);

const hasSectionLabel = (input: string, label: string) =>
  new RegExp(`^${escapeRegExp(label)}:[ \\t]*`, "im").test(input);

const readLabeledSection = (
  input: string,
  label: string,
  followingLabels: string[]
) => {
  const labelPattern = new RegExp(`^${escapeRegExp(label)}:[ \\t]*`, "im");
  const labelMatch = input.match(labelPattern);

  if (!labelMatch || labelMatch.index === undefined) {
    return "";
  }

  const start = labelMatch.index + labelMatch[0].length;
  const remaining = input.slice(start);
  const nextIndexes = followingLabels
    .map((nextLabel) =>
      remaining.search(new RegExp(`^${escapeRegExp(nextLabel)}:[ \\t]*`, "im"))
    )
    .filter((index) => index >= 0);
  const end = nextIndexes.length > 0 ? Math.min(...nextIndexes) : remaining.length;

  return cleanInputPart(remaining.slice(0, end));
};

const topicEvalMarker = /^===\s*TOPIC-EVAL BRIEF.*===\s*$/im;
const auditReportMarker = /^===\s*AUDIT REPORT\s*===\s*$/im;
const optionalAuditReportMarker = /^===\s*AUDIT REPORT.*===\s*$/im;

const parseScriptAuditInput = (input: string) => {
  const script = readLabeledSection(input, "Drafted script from Step 02", [
    "Topic-evaluation brief from Step 01",
  ]);

  if (hasSectionLabel(input, "Drafted script from Step 02")) {
    return {
      script,
      topicBrief: readLabeledSection(input, "Topic-evaluation brief from Step 01", []),
    };
  }

  const splitTopic = splitByMarker(input, topicEvalMarker);

  return {
    script: cleanInputPart(splitTopic.before),
    topicBrief: cleanInputPart(splitTopic.after),
  };
};

const parseRewriteInput = (input: string) => {
  const labeledScript = readLabeledSection(input, "Original script from Step 02", [
    "Audit report from Step 03",
    "Topic-evaluation brief from Step 01",
  ]);

  if (hasSectionLabel(input, "Original script from Step 02")) {
    return {
      script: labeledScript,
      audit: readLabeledSection(input, "Audit report from Step 03", [
        "Topic-evaluation brief from Step 01",
      ]),
      topicBrief: readLabeledSection(input, "Topic-evaluation brief from Step 01", []),
    };
  }

  const splitAudit = splitByMarker(input, auditReportMarker);
  const splitTopic = splitByMarker(splitAudit.after, topicEvalMarker);

  return {
    script: cleanInputPart(splitAudit.before),
    audit: cleanInputPart(splitTopic.before),
    topicBrief: cleanInputPart(splitTopic.after),
  };
};

const parseEditorBriefInput = (input: string) => {
  // Step 04 input only needs the Step 03 production-ready final script.
  // An audit report can still be pasted separately in the prompt, but it is optional.
  return {
    finalScript: cleanInputPart(input),
    audit: "",
  };
};

const getTopicFieldValue = (input: string, label: string) => {
  const match = input.match(new RegExp(`^${label}:[ \\t]*(.*)$`, "im"));
  return match?.[1]?.trim() ?? "";
};

const formatTopicInput = (input: string) => {
  const trimmed = input.trim();

  if (/^Topic:/im.test(trimmed)) {
    return [
      `Topic: ${getTopicFieldValue(trimmed, "Topic")}`,
      `Surface narrative most people know: ${getTopicFieldValue(
        trimmed,
        "Surface narrative most people know"
      )}`,
      `Why I think it might be interesting: ${getTopicFieldValue(
        trimmed,
        "Why I think it might be interesting"
      )}`,
      `Source / article / video / event link (optional): ${
        getTopicFieldValue(
          trimmed,
          "Source / article / video / event link \\(optional\\)"
        ) || "N/A"
      }`,
      `Mental model / framework, if you already have one (optional): ${
        getTopicFieldValue(
          trimmed,
          "Mental model / framework, if you already have one \\(optional\\)"
        ) || "N/A"
      }`,
    ].join("\n");
  }

  return [
    `Topic: ${trimmed}`,
    "Surface narrative most people know: N/A",
    "Why I think it might be interesting: N/A",
    "Source / article / video / event link (optional): N/A",
    "Mental model / framework, if you already have one (optional): N/A",
  ].join("\n");
};

const hasTopicInput = (input: string) => {
  if (/^Topic:/im.test(input)) {
    return Boolean(
      getTopicFieldValue(input, "Topic") &&
        getTopicFieldValue(input, "Surface narrative most people know") &&
        getTopicFieldValue(input, "Why I think it might be interesting")
    );
  }

  return false;
};

const hasRequiredPromptInput = (step: WorkflowStep, steps: WorkflowStep[]) => {
  switch (step.id) {
    case "01_TOPIC_EVALUATION":
      return hasTopicInput(step.input);
    case "02_SCRIPT_CREATION":
      return Boolean(cleanInputPart(step.input));
    case "03_AUDIT_AND_FINALIZE": {
      // Needs the Step 02 script; topic brief is optional
      const { script } = parseScriptAuditInput(step.input);
      return Boolean(script);
    }
    case "04_EDITOR_BRIEF": {
      // Needs the Step 03 final script with Status: PRODUCTION-READY
      const { finalScript } = parseEditorBriefInput(step.input);
      return Boolean(
        finalScript &&
          /Status:\s*PRODUCTION-READY/i.test(finalScript) &&
          !/Status:\s*NEEDS-ANOTHER-PASS/i.test(finalScript)
      );
    }
  }
};

export const getPromptInputChecks = (step: WorkflowStep) => {
  if (step.id === "01_TOPIC_EVALUATION") {
    return [
      {
        label: "Topic",
        required: true,
        ready: Boolean(getTopicFieldValue(step.input, "Topic")),
      },
      {
        label: "Surface narrative most people know",
        required: true,
        ready: Boolean(
          getTopicFieldValue(step.input, "Surface narrative most people know")
        ),
      },
      {
        label: "Why I think it might be interesting",
        required: true,
        ready: Boolean(
          getTopicFieldValue(step.input, "Why I think it might be interesting")
        ),
      },
      {
        label: "Source / article / video / event link",
        required: false,
        ready: Boolean(
          getTopicFieldValue(
            step.input,
            "Source / article / video / event link \\(optional\\)"
          )
        ),
      },
      {
        label: "Mental model / framework",
        required: false,
        ready: Boolean(
          getTopicFieldValue(
            step.input,
            "Mental model / framework, if you already have one \\(optional\\)"
          )
        ),
      },
    ];
  }

  if (step.id === "03_AUDIT_AND_FINALIZE") {
    const { script, topicBrief } = parseScriptAuditInput(step.input);

    return [
      {
        label: "Full Step 02 script-creation output",
        required: true,
        ready: Boolean(script),
      },
      {
        label: "Step 01 topic-evaluation brief (optional — enables chain-integrity checks)",
        required: false,
        ready: Boolean(topicBrief),
      },
    ];
  }

  if (step.id === "04_EDITOR_BRIEF") {
    const { finalScript } = parseEditorBriefInput(step.input);
    const productionReady =
      /Status:\s*PRODUCTION-READY/i.test(finalScript) &&
      !/Status:\s*NEEDS-ANOTHER-PASS/i.test(finalScript);

    return [
      {
        label: "Production-ready final script",
        required: true,
        ready: Boolean(finalScript),
      },
      {
        label: "Status: PRODUCTION-READY",
        required: true,
        ready: Boolean(productionReady),
      },
    ];
  }

  return [
    {
      label: "Full Step 01 topic-evaluation output",
      required: true,
      ready: Boolean(cleanInputPart(step.input)),
    },
  ];
};

export const getOutputContractChecks = (
  step: WorkflowStep,
  output = step.aiOutput
): ContractCheck[] => {
  const trimmed = output.trim();

  if (!trimmed) {
    return [
      {
        label: "AI output pasted",
        required: true,
        ready: false,
      },
    ];
  }

  const contract = outputContracts[step.id];

  if (contract.terminalPattern?.test(trimmed)) {
    return [
      {
        label: "Recognized terminal stop",
        required: true,
        ready: true,
      },
    ];
  }

  if (step.id === "03_AUDIT_AND_FINALIZE") {
    return [
      {
        label: "Final Script header",
        required: true,
        ready: /^# Final Script:/im.test(trimmed),
      },
      {
        label: "Status: PRODUCTION-READY",
        required: true,
        ready:
          /Status:\s*PRODUCTION-READY/i.test(trimmed) &&
          !/Status:\s*NEEDS-ANOTHER-PASS/i.test(trimmed),
      },
      {
        label: "Final title",
        required: true,
        ready: /^##\s*3\.\s*Final Title/im.test(trimmed),
      },
      {
        label: "Final Spoken Script",
        required: true,
        ready: /^##\s*8\.\s*Final Spoken Script/im.test(trimmed),
      },
    ];
  }

  if (step.id === "04_EDITOR_BRIEF") {
    return [
      {
        label: "Editor brief header",
        required: true,
        ready: /^# Editor Brief:/im.test(trimmed),
      },
      {
        label: "Locked script section",
        required: true,
        ready: /^##\s*1\.\s*(Script\b|Script Lineage\b)/im.test(trimmed),
      },
      {
        label: "Locked spoken script",
        required: true,
        ready:
          /\*\*Locked spoken script\b/i.test(trimmed) ||
          /```(?:md|markdown)?\n[\s\S]*?```/i.test(trimmed),
      },
      {
        label: "Shot list section",
        required: true,
        ready: /^##\s*2\.\s*Shot List\b/im.test(trimmed),
      },
      {
        label: "B-roll section",
        required: true,
        ready: /^##\s*3\.\s*B-?Roll\b/im.test(trimmed),
      },
      {
        label: "On-screen text section",
        required: true,
        ready: /^##\s*4\.\s*On-?Screen Text\b/im.test(trimmed),
      },
      {
        label: "Audio section",
        required: true,
        ready: /^##\s*5\.\s*Audio\b/im.test(trimmed),
      },
      {
        label: "Color and look section",
        required: true,
        ready: /^##\s*6\.\s*Color\s*(?:&|and)\s*(?:Look|Visual Treatment)\b/im.test(trimmed),
      },
      {
        label: "Thumbnail section",
        required: true,
        ready: /^##\s*7\.\s*Thumbnails?\b/im.test(trimmed),
      },
      {
        label: "Visual references and licensing section",
        required: true,
        ready: /^##\s*8\.\s*(?:Must-?Keep\s+)?Visual References\b[\s\S]*Licensing/im.test(trimmed),
      },
      {
        label: "References and sources section",
        required: true,
        ready: /^##\s*9\.\s*(?:References|Sources)\b/im.test(trimmed),
      },
    ];
  }

  return [
    ...(contract.requiredPatterns ?? []).map((item) => ({
      label: item.label,
      required: true,
      ready: item.pattern.test(trimmed),
    })),
    ...contract.requiredSections.map((section) => ({
      label: section.replace(/^#+\s+/, ""),
      required: true,
      ready: hasMarkdownLineStartingWith(trimmed, section),
    })),
  ];
};


const generatePrompt = (step: WorkflowStep, steps: WorkflowStep[]) => {
  if (!hasRequiredPromptInput(step, steps)) {
    return "";
  }

  switch (step.id) {
    case "01_TOPIC_EVALUATION":
      return replaceFencedBlock(step.promptTemplate, 1, formatTopicInput(step.input));
    case "02_SCRIPT_CREATION":
      return replaceFencedBlock(step.promptTemplate, 1, step.input);
    case "03_AUDIT_AND_FINALIZE": {
      // Block 1: the Step 02 script; Block 2: optional Step 01 topic-eval brief
      const { script, topicBrief } = parseScriptAuditInput(step.input);

      return replaceFencedBlock(
        replaceFencedBlock(
          step.promptTemplate,
          1,
          outputOrMissing(script, "Step 02 script output")
        ),
        2,
        optionalOutput(topicBrief, "Step 01 topic-evaluation output")
      );
    }
    case "04_EDITOR_BRIEF": {
      // Block 1: Step 03 production-ready final script.
      // Block 2: optional audit report; omitted by default because the audit is internal.
      const { finalScript } = parseEditorBriefInput(step.input);

      return replaceFencedBlock(
        replaceFencedBlock(
          step.promptTemplate,
          1,
          outputOrMissing(finalScript, "Stage 3 production-ready final script")
        ),
        2,
        "N/A — Audit report kept internal."
      );
    }
    default:
      return replaceFencedBlock(step.promptTemplate, 1, step.input);
  }
};

export const getKnowledgeBaseFileCount = (step: WorkflowStep) =>
  knowledgeBaseByStep[step.id]?.length ?? 0;

export const buildPromptContextPack = (step: WorkflowStep) => {
  const prompt = step.generatedPrompt.trim();

  if (!prompt) {
    return "";
  }

  const knowledgeBaseFiles = knowledgeBaseByStep[step.id] ?? [];
  const requiredReading = knowledgeBaseFiles.flatMap((file) => [
    `### ${file.path}`,
    fencedBlockWithInfo(file.content, "markdown"),
  ]);

  return [
    "# Curious Chappal AI Workflow Pack",
    "",
    `Step: ${step.id} - ${step.name}`,
    "",
    "Use the generated prompt as the task. The required reading files are included below so this prompt pack is self-contained for external AI chats that cannot access the local folder.",
    "",
    "## Generated Prompt",
    fencedBlockWithInfo(prompt, "markdown"),
    "",
    "## Required Reading Files",
    ...requiredReading,
  ].join("\n");
};

const deriveStatus = (step: WorkflowStep): WorkflowStatus => {
  if (step.status === "completed" && step.aiOutput.trim()) {
    return "completed";
  }

  if (step.aiOutput.trim()) {
    return "output_added";
  }

  if (step.generatedPrompt.trim()) {
    return "prompt_generated";
  }

  return "not_started";
};

export const updateStepWithDependentInvalidation = (
  session: WorkflowSession,
  index: number,
  updates: Partial<WorkflowStep>
): WorkflowSession => {
  const currentStep = session.steps[index];

  if (!currentStep) {
    return refreshSession(session);
  }

  const rawInputChanged =
    currentStep.id === "01_TOPIC_EVALUATION" &&
    typeof updates.input === "string" &&
    updates.input !== currentStep.input;

  return refreshSession({
    ...session,
    steps: session.steps.map((step, stepIndex) => {
      if (stepIndex === index) {
        const updatedStep = { ...step, ...updates };

        return rawInputChanged
          ? {
              ...updatedStep,
              generatedPrompt: "",
              aiOutput: "",
              status: "not_started",
            }
          : updatedStep;
      }

      return step;
    }),
  });
};

export const refreshSession = (
  session: WorkflowSession,
  touchUpdatedAt = true
): WorkflowSession => {
  const existingById = new Map(session.steps.map((step) => [step.id, step]));
  const steps: WorkflowStep[] = [];

  stepDefinitions.forEach((definition, index) => {
    const existing = existingById.get(definition.id);
    const base = existing
      ? {
          ...emptyStepFromDefinition(definition),
          ...existing,
          stepNumber: definition.stepNumber,
          name: definition.name,
          description: definition.description,
          promptTemplate: definition.promptTemplate,
        }
      : emptyStepFromDefinition(definition);

    if (index > 0) {
      const freshAutoFill = buildStepInput(steps, index);
      const currentInput = base.input.trim();

      if (!currentInput) {
        // Blank input — auto-fill from prior steps if we have content
        base.input = freshAutoFill;
      } else if (freshAutoFill && existing) {
        // Input is non-blank. Check if it was previously auto-filled (not manually edited).
        // We detect this by comparing the saved input to what buildStepInput would have
        // produced from the *previously saved* step outputs. If they match, the user
        // never edited it, so it's safe to update it with fresher content.
        // We rebuild what the old auto-fill would have looked like using the existing
        // session's steps (before any updates in this refresh pass).
        const oldStepsSnapshot = session.steps.slice(0, index) as WorkflowStep[];
        const previousAutoFill = buildStepInput(oldStepsSnapshot, index).trim();
        if (currentInput === previousAutoFill) {
          // Was auto-filled, not manually edited — update to fresher content
          base.input = freshAutoFill;
        }
        // else: user has custom input → leave it untouched
      }
    }

    base.generatedPrompt = generatePrompt(base, steps);
    base.status = deriveStatus(base);

    steps.push(base);
  });

  return {
    ...session,
    productionChecklist:
      { ...createEmptyProductionChecklist(), ...(session.productionChecklist ?? {}) },
    productionReadyAt:
      isProductionChecklistComplete(session.productionChecklist) ? session.productionReadyAt ?? "" : "",
    steps,
    updatedAt: touchUpdatedAt ? nowIso() : session.updatedAt,
  };
};


export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
