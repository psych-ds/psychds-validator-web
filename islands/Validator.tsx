import { useEffect, useState, useRef } from "preact/hooks";
import Output from './Output.tsx';
import { psychDSFileDeno, FileIgnoreRules, readFileTree } from "../static/fileio.js";
import { validate } from "../static/psychds-validator.js";
import { DatasetIssues } from "../static/datasetIssues.js";

interface FileEntry {
    name: string;
    lines: string[];
    text: string;
    type: 'file';
}

interface DirectoryEntry {
    name: string;
    type: 'directory';
    contents: { [key: string]: TreeEntry };
}

type TreeEntry = FileEntry | DirectoryEntry;

export default function Validator() {
    const [issues, setIssues] = useState({
        'errors': [],
        'warnings': []
    });
    const [validationComplete, setValidationComplete] = useState(false);
    const [validationResult, setValidationResult] = useState(false);
    const [showWarnings, setShowWarnings] = useState(false);
    const [verbose, setVerbose] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

        const tree: { [key: string]: TreeEntry } = {};

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const path = file.webkitRelativePath.split('/');
            
            // Skip the top-level folder
            path.shift();
            
            if (path.length === 0) continue; // Skip if it's the top-level folder itself
            
            let currentLevel = tree;

            for (let j = 0; j < path.length; j++) {
                const part = path[j];
                if (j === path.length - 1) {
                    // It's a file
                    const contents = await file.text();
                    currentLevel[part] = {
                        name: part,
                        lines: contents.split('\n'),
                        text: contents,
                        type: 'file'
                    };
                } else {
                    // It's a directory
                    if (!currentLevel[part]) {
                        currentLevel[part] = {
                            name: part,
                            type: 'directory',
                            contents: {}
                        };
                    }
                    currentLevel = (currentLevel[part] as DirectoryEntry).contents;
                }
            }
        }

        try {
            console.log(tree)
            const fileTree = await readFileTree(tree);
            const result = await validate(fileTree, {});
            console.log(result);
            setValidationComplete(true);
            setValidationResult(result.valid);
            setIssues(result.issues.formatOutput());
        } catch (error) {
            console.error("Error during validation:", error);
            // Handle error (e.g., show error message to user)
        } finally {
            setIsValidating(false);
            // Reset the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const changeShowWarnings = (event: Event) => {
        setShowWarnings((event.target as HTMLInputElement).checked);
    };

    const changeVerbose = (event: Event) => {
        setVerbose((event.target as HTMLInputElement).checked);
    };

    return (
        <div class="container pl-16 pr-auto text-left">
             <div class="border rounded-2xl bg-gray-100 border-black border-solid p-6">
                 <h2 class="text-left">For help generating your metadata files, try the <a target="_blank" style="color:blue" href="https://psych-ds.github.io/cedar-wizard-psychds/">Cedar Metadata Wizard</a></h2>

             </div>
             <br></br>
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
                <hr class="pt-2 pb-2"/>
                <form>
                    <label>
                        <b>Options:</b>
                    </label>
                    <input id="showWarnings" class="mr-2 ml-2" type="checkbox" name="showWarnings" onChange={changeShowWarnings}></input>
                    <label for="showWarnings">Show Warnings</label>
                    <input id="verbose" class="mr-2 ml-2" type="checkbox" name="verbose" onChange={changeVerbose}></input>
                    <label for="verbose">Verbose</label>
                </form>
            </div>
            <br/>
            <div class="rounded-2xl border bg-gray-100 border-black border-solid p-6 max-h-screen overflow-auto">
                {validationComplete && <Output issues={issues} validationResult={validationResult} showWarnings={showWarnings} verbose={verbose}/>}
            </div>
        </div>
    );
}
