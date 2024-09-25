import { useEffect, useState } from "preact/hooks";

// Define types for validation issues
export type Severity = 'warning' | 'error' | 'ignore'

export interface IssueFileDetail {
  name: string
  path: string
  relativePath: string
}

export interface IssueFileOutput {
  key: string
  code: number
  file: IssueFileDetail
  evidence: string
  line: number
  character: number
  severity: Severity
  reason: string
  helpUrl: string
}

export interface IssueOutput {
  severity: Severity
  key: string
  code: number
  reason: string
  files: IssueFileOutput[]
  additionalFileCount: number
  helpUrl: string
}

export interface FullTestIssuesReturn {
  errors: IssueOutput[]
  warnings: IssueOutput[]
}

// Define types for steps and their status
interface StepStatus {
  complete: boolean
  success: boolean
  issue?: any
}

interface StepMessage {
  imperative: string
  pastTense: string
}

interface Step {
  key: string
  message: StepMessage
}

interface SuperStep extends Step {
  subSteps: Step[]
}

// Define props for the Output component
interface Props {
  issues: FullTestIssuesReturn
  validationComplete: boolean
  validationResult: boolean
  showWarnings: boolean
  useEvents: boolean
  stepStatus: Map<string, StepStatus>
  steps: SuperStep[]
}

// StepItem component to render individual steps
const StepItem = ({ step, status, stepStatus }: { step: SuperStep, status: StepStatus, stepStatus: Map<string, StepStatus> }) => {
  const message = status.complete ? step.message.pastTense : step.message.imperative;
  const icon = status.complete ? (status.success ? "✓" : "✗") : "⋯";
  const iconColor = status.complete ? (status.success ? "text-green-600" : "text-red-600") : "text-yellow-600";

  return (
    <div class="bg-white rounded-2xl hover:scale-[1.03] transition-transform duration-100 border border-black border-solid p-4 mb-4">
      <h4 class="font-semibold flex items-center">
        <span class={`${iconColor} mr-2`}>{icon}</span>
        {message}
      </h4>
      {status.issue && (
        <div class="mt-2 text-red-600">
          <p><b>Issue:</b> {status.issue.reason}</p>
          {status.issue.evidence && (
            <p class="mt-1"><b>Evidence:</b> {status.issue.evidence}</p>
          )}
        </div>
      )}
      {step.subSteps && step.subSteps.length > 0 && (
        <div class="mt-2 pl-4 border-l-2 border-gray-300">
          {step.subSteps.map((subStep) => {
            const subStatus = stepStatus.get(subStep.key) || { complete: false, success: false };
            const subMessage = subStatus.complete ? subStep.message.pastTense : subStep.message.imperative;
            const subIcon = subStatus.complete ? (subStatus.success ? "✓" : "✗") : "⋯";
            const subIconColor = subStatus.complete ? (subStatus.success ? "text-green-600" : "text-red-600") : "text-yellow-600";
            
            return (
              <div key={subStep.key} class="mt-2">
                <p class="flex items-center">
                  <span class={`${subIconColor} mr-2`}>{subIcon}</span>
                  {subMessage}
                </p>
                {subStatus.issue && (
                  <div class="mt-1 ml-6 text-red-600">
                    <p><b>Issue:</b> {subStatus.issue.reason}</p>
                    {subStatus.issue.files && (
                     <div>
                      <p class="mt-1"><b>File:</b> {subStatus.issue.files.values().next().value.path}</p>
                      <p class="mt-1"><b>Evidence:</b> {subStatus.issue.files.values().next().value.evidence}</p>

                     </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Main Output component
export default function Output({ issues, validationComplete, validationResult, showWarnings, useEvents, stepStatus, steps }: Props) {
    if (useEvents) {
        return (
          <div class="bg-white rounded-2xl border border-black border-solid mb-6 p-6">
            <h3 class="text-xl font-bold mb-4">
              Validation Progress: 
              {validationComplete && (
                <span class={validationResult ? "text-green-600" : "text-red-600"}>
                  {validationResult ? " Dataset is valid" : " Dataset is invalid"}
                </span>
              )}
            </h3>
            <div id="validation-progress" class="space-y-4">
              {steps.map((step) => (
                <StepItem 
                  key={step.key}
                  step={step} 
                  status={stepStatus.get(step.key) || { complete: false, success: false }}
                  stepStatus={stepStatus}
                />
              ))}
            </div>
          </div>
        );
      }

  // Render validation result and issues when not using events
  return (
    <div class=''>
      {/* Display overall validation result */}
      {validationResult ? 
        <div class="bg-white rounded-2xl border border-black border-solid mb-6 p-6">
          <h3 class="text-green-600"><b>
            **************************************************<br />
            This dataset appears to be psych-DS compatible<br />
            **************************************************
          </b></h3>
        </div>
        : 
        <div class=" bg-white rounded-2xl border border-black border-solid mb-6 p-6">
          <h3 class="text-red-600"><b>
            ***********************************************************<br />
            This dataset does not appear to be psych-DS compatible<br />
            ***********************************************************
          </b></h3>
        </div>
      }
      {issues.errors.map((item, index) => (
        <div key={index} class="bg-white rounded-2xl hover:scale-[1.03] transition-transform duration-100 border border-black border-solid mb-6 p-6">
          <h3><b class="text-red-600">ERROR:</b> {item.key}</h3>
          <hr />
          <p><b>Reason: </b>{item.reason}</p>
          <hr />
          {item.files.length > 0 &&
            <div>
              <b>Evidence:</b>
              <ul>
                {item.files.map((file, i) => (
                  <li key={i}>
                    <details>
                      <summary>
                        {file.file.path}
                      </summary>
                      {file.evidence && 
                        <div class=' border border-black border-solid mb-6 p-6'>
                          {file.evidence}
                        </div>
                      }
                    </details>
                  </li>
                ))}  
              </ul>
            </div>
          }
        </div>
      ))}
      {showWarnings &&
        issues.warnings.map((item, index) => (
          <div key={index} class="bg-white rounded-2xl hover:scale-[1.03] transition-transform duration-100 border border-black border-solid mb-6 p-6">
            <h3><b class="text-yellow-600">WARNING:</b> {item.key}</h3>
            <hr />
            <p><b>Reason: </b>{item.reason}</p>
            <hr />
            {item.files.length > 0 &&
              <div>
                <b>Evidence:</b>
                <ul>
                  {item.files.map((file, i) => (
                    <li key={i}>
                      <details>
                        <summary>
                          {file.file.path}
                        </summary>
                        {file.evidence &&
                          <div class=' border border-black border-solid mb-6 p-6'>
                            {file.evidence}
                          </div>
                        }
                      </details>
                    </li>
                  ))}  
                </ul>
              </div>
            }
          </div>
        ))
      }
    </div>
  );
}