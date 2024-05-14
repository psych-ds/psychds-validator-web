import { useEffect } from "preact/hooks";
import { DatasetIssues } from "../static/psychds-validator.js";

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

/**
 * Dataset issue, derived from OpenNeuro schema and existing validator implementation
 */
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

interface Props {
    issues: FullTestIssuesReturn
    validationResult: boolean
    showWarnings: boolean
    verbose: boolean
}

export default function Output({issues,validationResult,showWarnings,verbose}:Props){
    return (
        <div class=''>
            {validationResult ? 
            <div class="border border-black border-solid mb-6 p-6">
                <h3 class="text-green-600"><b>
                    **************************************************<br />
                    This dataset appears to be psych-DS compatible<br />
                    **************************************************
                    </b></h3>
            </div>
            : 
            <div class="border border-black border-solid mb-6 p-6">
                <h3 class="text-red-600"><b>
                    ***********************************************************<br />
                    This dataset does not appear to be psych-DS compatible<br />
                    ***********************************************************
                    
                    </b></h3>
            </div>
            }
            {issues.errors.map((item,index) => (
                <div class="hover:scale-[1.03] transition-transform duration-100 border border-black border-solid mb-6 p-6">
                    <h3 ><b class="text-red-600">ERROR:</b> {item.key}</h3>
                    <hr />
                    <p><b>Reason: </b>{item.reason}</p>
                    <hr />
                    {item.files.length > 0 &&
                        <div>
                            <b>Evidence:</b>
                            <ul>
                                {item.files.map((file,i) => (
                                <li>
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
                issues.warnings.map((item,index) => (
                    <div class="hover:scale-[1.03] transition-transform duration-100 border border-black border-solid mb-6 p-6">
                        <h3 ><b class="text-yellow-600">WARNING:</b> {item.key}</h3>
                        <hr />
                        <p><b>Reason: </b>{item.reason}</p>
                        <hr />
                        {item.files.length > 0 &&
                        <div>
                            <b>Evidence:</b>
                            <ul>
                                {item.files.map((file,i) => (
                                <li>
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
    )
}