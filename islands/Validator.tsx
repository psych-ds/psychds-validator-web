
import Output from './Output.tsx'
import { useEffect, useState } from "preact/hooks";
import { psychDSFileDeno, FileIgnoreRules,_readFileTree,readFileTree } from "../static/fileio.js";
import { validate } from "../static/psychds-validator.js";
import { DatasetIssues } from "../static/datasetIssues.js"

interface FileEntry {
    name: string;
    lines: string[];
    text: string;
    type: 'file';
}

interface DirectoryEntry {
    name: string;
    type: 'directory';
    contents: object; // Recursive type definition
}

type TreeEntry = FileEntry | DirectoryEntry;

class FileTree {
    path: string;
    name: string;
    files: psychDSFileDeno[];
    directories: FileTree[];
    parent: FileTree|null;
    constructor(path: string, name:string, parent:FileTree|null){
        this.path = path;
        this.files = [];
        this.directories = [];
        this.name = name;
        this.parent = parent;
    }
    contains(parts: string[]): boolean {
        if (parts.length === 0) {
            return false;
        } else if (parts.length === 1) {
            return this.files.some((x)=>x.name === parts[0]);
        } else if (parts.length > 1) {
            const nextDir = this.directories.find((x)=>x.name === parts[0]);
            if (nextDir) {
                return nextDir.contains(parts.slice(1, parts.length));
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
}

async function readDirectory(dirHandle: FileSystemDirectoryHandle) {
    const tree: { [key:string]: TreeEntry} = {};

    for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') {
            const fileHandle = await dirHandle.getFileHandle(entry.name);
            const file = await fileHandle.getFile();
            const contents = await file.text();
            const lines = contents.split('\n');
            tree[entry.name] = {
                name: entry.name,
                lines:lines,
                text:contents,
                type: 'file'
            };
        } else if (entry.kind === 'directory') {
            const subdirHandle = await dirHandle.getDirectoryHandle(entry.name);
            tree[entry.name] = {
                name: entry.name,
                type: 'directory',
                contents: await readDirectory(subdirHandle)
            };
        }
    }

    return tree as { [key:string]: TreeEntry};
}
/*
async function _readFileTree(dirDict:{ [key:string]: TreeEntry}, name:string, relativePath:string, ignore:FileIgnoreRules, parent:FileTree|null, context?: object | null) {
    const tree = new FileTree(relativePath, name, parent);
    for ( const key in dirDict){
        const path = (relativePath === '/') ? `/${key}` : `${relativePath}/${key}`
        if(dirDict[key]['type'] === 'file'){
            
            const file = new psychDSFileDeno(null,path,ignore)
            file.fileText = (dirDict[key] as FileEntry)['text']
            if(key === ".psychdsignore"){
                ignore.add((dirDict[key] as FileEntry)['lines'])
            }
            if(key.endsWith('.json')){
                let json = {}
                let exp = []
                try{
                    json = await JSON.parse(file.fileText)
                    if(!parent && key.endsWith('dataset_description.json') && '@context' in json){
                        context = json['@context'] as object
                    }
                    else if(context){
                        json = {
                            ...json,
                            '@context': context
                        }
                    }
                }
                catch(error){
                    file.issueInfo.push({
                        key: 'InvalidJsonFormatting'
                    })
                }
                try{
                    exp = await jsonld.expand(json)
                    if (exp.length > 0)
                        file.expanded = exp[0]
                }
                catch(error){
                    file.issueInfo.push({
                        key: 'InvalidJsonldSyntax',
                        evidence: `${error.message.split(';')[1]}`
                      })
                }
            }
            tree.files.push(file)
        }
        else{
            const dirTree = await _readFileTree((dirDict[key] as DirectoryEntry)['contents'] as { [key:string]: TreeEntry},key,path,ignore,tree,context)
            tree.directories.push(dirTree)
        }
    }
    return tree;
}*/



export default function Validator() {
    const [issues, setIssues] = useState({
        'errors':[],
        'warnings':[]
    });
    const [validationComplete, setValidationComplete] = useState(false);
    const [validationResult, setValidationResult] = useState(false);
    const [showWarnings, setShowWarnings] = useState(false);
    const [verbose, setVerbose] = useState(false);


    const handleValidate = async (event: Event) => {
        event.preventDefault();
        // @ts-ignore: reason
        const dirHandle = await globalThis.showDirectoryPicker();
        const dirDict = await readDirectory(dirHandle);
        const fileTree = await readFileTree(dirDict)
        const result = await validate(fileTree,{})
        console.log(result)
        setValidationComplete(true);
        setValidationResult(result.valid)
        setIssues(result.issues.formatOutput())
    }

    const changeShowWarnings = (event: Event) => {
        setShowWarnings((event.target as HTMLInputElement).checked)
    }

    const changeVerbose = (event: Event) => {
        setVerbose((event.target as HTMLInputElement).checked)
    }

    return (

        <div class="container pl-16 pr-auto text-left  ">
            <div class="border border-black border-solid p-6">
                <h2 class="text-left"><b>Select a Psych-DS dataset to validate</b></h2>
                {/* @ts-ignore */}
                <input class="pb-2" type='file' directory webkitdirectory
                onClick={handleValidate}
                ></input>
                <hr class="pt-2 pb-2"/>
                <form>
                    <label>
                        <b>
                            Options:
                        </b>
                    </label>
                    <input id="showWarnings" class="mr-2 ml-2" type="checkbox" name="showWarnings" onChange={changeShowWarnings}></input>
                    <label for="showWarnings">
                        Show Warnings
                    </label>
                    <input id="verbose" class="mr-2 ml-2" type="checkbox" name="verbose" onChange={changeVerbose}></input>
                    <label for="verbose">
                        Verbose
                    </label>
                </form>
            </div>
            <div class="border border-black border-solid p-6 max-h-screen overflow-auto">
                {validationComplete && <Output issues={issues} validationResult={validationResult} showWarnings={showWarnings} verbose={verbose}/>}
            </div>
        </div>
    );
}
