import { useEffect, useState, useRef } from "preact/hooks";
import Output from './Output.tsx';
import FileTreeView from './FileTreeView.tsx';
import EventEmitter from "https://esm.sh/eventemitter3@5.0.1";

// Define global types for the window object
declare global {
    interface Window {
        validateWeb: (fileTree: any, options: any) => Promise<any>;
        ValidationProgressTracker: new (eventEmitter: EventEmitter) => any;
    }
}

// Define types for file tree structure
interface FileEntry {
    name: string;
    file: object;
    type: 'file';
}

interface DirectoryEntry {
    name: string;
    type: 'directory';
    contents: { [key: string]: TreeEntry };
}

type TreeEntry = FileEntry | DirectoryEntry;

function anyInMap<K, V>(map: Map<K, V>, condition: (value: V, key: K) => boolean): boolean {
    for (const [key, value] of map.entries()) {
      if (condition(value, key)) {
        return true;
      }
    }
    return false;
  }

// Main Validator component
export default function Validator() {
    // State for validation results and UI control
    const [issues, setIssues] = useState({ errors: [], warnings: [] });
    const [validationComplete, setValidationComplete] = useState(false);
    const [validationResult, setValidationResult] = useState(false);
    const [showWarnings, setShowWarnings] = useState(false);
    const [useEvents, setUseEvents] = useState(true);
    const [steps, setSteps] = useState([]);
    const [isValidating, setIsValidating] = useState(false);
    const [stepStatus, setStepStatus] = useState(new Map());
    const [fileTree, setFileTree] = useState<{ [key: string]: TreeEntry }>({});
    const [isFileTreeExpanded, setIsFileTreeExpanded] = useState(false);

    useEffect(() => {
        const eventEmitter = new EventEmitter()
        const progress = new window.psychDSValidator.ValidationProgressTracker(eventEmitter);
        setSteps(progress.steps);
        
      }, []);
    
    // Reference for file input
    const fileInputRef = useRef<HTMLInputElement>(null);


    // Function to handle file validation
    const handleValidate = async (event: Event) => {
        event.preventDefault();
        const input = event.target as HTMLInputElement;
        const files = input.files;

        if (!files || files.length === 0) {
            console.error("No files selected");
            return;
        }

        setIsValidating(true);
        setValidationComplete(false);

        // Build file tree structure
        const tree: { [key: string]: TreeEntry } = {};
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            console.log('File:', file.name);
            console.log('Raw webkitRelativePath:', JSON.stringify(file.webkitRelativePath));
            console.log('Split result:', file.webkitRelativePath.split('/'));
            
            const path = file.webkitRelativePath.split('/');
            path.shift(); // Skip the top-level folder
            
            if (path.length === 0) continue;
            
            let currentLevel = tree;
            for (let j = 0; j < path.length; j++) {
                const part = path[j];
                if (j === path.length - 1) {
                    // It's a file
                    currentLevel[part] = { name: part, type: 'file', file: file };
                } else {
                    // It's a directory
                    if (!currentLevel[part]) {
                        currentLevel[part] = { name: part, type: 'directory', contents: {} };
                    }
                    currentLevel = (currentLevel[part] as DirectoryEntry).contents;
                }
            }
        }

        setFileTree(tree);

        try {
            const eventEmitter = new EventEmitter()
            const progress = new window.psychDSValidator.ValidationProgressTracker(eventEmitter);
            setStepStatus(progress.stepStatus)

            // Handle step status changes
            eventEmitter.on('stepStatusChange', ({ stepStatus: newStepStatus, superStep }) => {
                console.log('Step status change:', newStepStatus, 'Super step:', superStep);
                let prevComplete = true
                // Update step status
                setStepStatus(prevStatus => {
                    const updatedStatus = new Map(prevStatus);
                    newStepStatus.forEach(([key, value]) => {
                        const thisSup = progress.steps.filter((val) => val.key == key)[0]
                        if (prevComplete)
                            updatedStatus.set(key, value);
                        if (!(value.complete && value.success) && (!thisSup || thisSup.subSteps.length == 0)){
                            prevComplete = false
                            setValidationResult(false)
                        }

                    });
                    if (newStepStatus.every(([key, value]) => value.success && value.complete)) {
                        setValidationComplete(true)
                        setValidationResult(true)
                    }
                    return updatedStatus;
                });
              
                setSteps(progress.steps)
            });

            // Perform validation
            const result = await window.psychDSValidator.validateWeb(tree, {emitter: eventEmitter});

            // Update state with validation results
            setValidationComplete(true);
            if(!useEvents){
                setValidationResult(result.valid);
                setIssues(result.issues.formatOutput());
            }
        } catch (error) {
            console.error("Error during validation:", error);
        } finally {
            setIsValidating(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Event handlers for UI controls
    const changeShowWarnings = (event: Event) => {
        setShowWarnings((event.target as HTMLInputElement).checked);
    };

    const changeUseEvents = (event: Event) => {
        const isChecked = (event.target as HTMLInputElement).checked;
        setUseEvents(isChecked);
    };

    // Render component
    return (
        <div class="container pl-16 pr-auto text-left">
            {/* Cedar Metadata Wizard link */}
            <div class="border rounded-2xl bg-gray-100 border-black border-solid p-6">
                <ul>
                    <li>
                        <h2 class="text-left">For help structuring your Psych-DS dataset, try the <a target="_blank" style="color:blue" href="https://psychds-docs.readthedocs.io/en/latest/guides/1_getting_started/">Getting Started Guide</a></h2>
                    </li>
                    <br/>

                    <li>
                        <h2 class="text-left">For help generating your metadata files, try the <a target="_blank" style="color:blue" href="https://psych-ds.github.io/cedar-wizard-psychds/">Cedar Metadata Wizard</a></h2>
                    </li>

                </ul>
            </div>
            <br />
            {/* File selection and options */}
            <div class="border rounded-2xl bg-gray-100 border-black border-solid p-6">
                <h2 class="text-left"><b>Select a Psych-DS dataset to validate</b></h2>
                <div class="flex items-center">
                    <input 
                        ref={fileInputRef}
                        class="pb-2" 
                        type='file' 
                        webkitdirectory="true"
                        directory=""
                        multiple
                        onChange={handleValidate}
                        disabled={isValidating}
                    />
                    {isValidating && (
                        <div class="flex items-center ml-4">
                            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>
                            <span>Validating dataset... this may take a moment</span>
                        </div>
                    )}
                </div>
                <h2><i>Note: Although the word "upload" may appear when selecting a folder, no files will be sent to our server or stored in any way.</i></h2>
                <hr class="pt-2 pb-2"/>
                <form>
                    <label><b>Options:</b></label>
                    <input id="showWarnings" class="mr-2 ml-2" type="checkbox" name="showWarnings" onChange={changeShowWarnings} />
                    <label for="showWarnings">Show Warnings</label>
                    <input 
                        id="useEvents" 
                        class="mr-2 ml-2" 
                        type="checkbox" 
                        name="useEvents" 
                        onChange={changeUseEvents} 
                        checked={useEvents}
                    />
                    <label for="useEvents">Show Progress</label>
                </form>
            </div>
            <br/>
            <div class="rounded-2xl border bg-gray-100 border-black border-solid p-6 mb-6">
                <div class="flex justify-between items-center">
                    <h3 class="text-xl font-bold">Dataset File Structure:</h3>
                    <button 
                        onClick={() => setIsFileTreeExpanded(!isFileTreeExpanded)}
                        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        {isFileTreeExpanded ? 'Collapse' : 'Expand'}
                    </button>
                </div>
                {isFileTreeExpanded && <FileTreeView tree={fileTree} />}
            </div>
            {/* Output component */}
            <div class="rounded-2xl border bg-gray-100 border-black border-solid p-6 max-h-screen overflow-auto">
                {(validationComplete || useEvents) && 
                    <Output 
                        issues={issues} 
                        validationComplete={validationComplete}
                        validationResult={validationResult} 
                        showWarnings={showWarnings}
                        useEvents={useEvents} 
                        stepStatus={stepStatus} 
                        steps={steps}
                    />
                }
            </div>
        </div>
    );
}
