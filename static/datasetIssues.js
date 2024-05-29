// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

class Issue {
    key;
    severity;
    reason;
    requires;
    files;
    constructor({ key, severity, reason, requires, files }){
        this.key = key;
        this.severity = severity;
        this.reason = reason;
        this.requires = requires;
        if (Array.isArray(files)) {
            this.files = new Map();
            for (const f of files){
                this.files.set(f.path, f);
            }
        } else {
            this.files = files;
        }
    }
    get helpUrl() {
        return `https://neurostars.org/search?q=${this.key}`;
    }
}
const CODE_DEPRECATED = Number.MIN_SAFE_INTEGER;
const issueFile = (issue, f)=>{
    const evidence = f.evidence || '';
    const reason = issue.reason || '';
    const line = f.line || 0;
    const character = f.character || 0;
    return {
        key: issue.key,
        code: CODE_DEPRECATED,
        file: {
            path: f.path,
            name: f.name,
            relativePath: f.path
        },
        evidence,
        line,
        character,
        severity: issue.severity,
        reason,
        helpUrl: issue.helpUrl
    };
};
class DatasetIssues extends Map {
    schema;
    constructor(schema){
        super();
        this.schema = schema ? schema : {};
    }
    add({ key, reason, severity = 'error', requires = [], files = [] }) {
        const existingIssue = this.get(key);
        if (existingIssue) {
            for (const f of files){
                existingIssue.files.set(f.path, f);
            }
            return existingIssue;
        } else {
            const newIssue = new Issue({
                key,
                severity,
                reason,
                requires,
                files
            });
            this.set(key, newIssue);
            return newIssue;
        }
    }
    hasIssue({ key }) {
        if (this.has(key)) {
            return true;
        }
        return false;
    }
    addSchemaIssue(key, files) {
        if (this.schema) {
            this.add({
                key: this.schema[`rules.errors.${key}.code`],
                reason: this.schema[`rules.errors.${key}.reason`],
                severity: this.schema[`rules.errors.${key}.level`],
                requires: this.schema[`rules.errors.${key}.requires`],
                files: files
            });
        }
    }
    fileInIssues(path) {
        const matchingIssues = [];
        for (const [_, issue] of this){
            if (issue.files.get(path)) {
                matchingIssues.push(issue);
            }
        }
        return matchingIssues;
    }
    getFileIssueKeys(path) {
        return this.fileInIssues(path).map((issue)=>issue.key);
    }
    filterIssues(rulesRecord) {
        for (const [_, issue] of this){
            if (!issue.requires.every((req)=>rulesRecord[req])) {
                this.delete(_);
            }
        }
    }
    formatOutput() {
        const output = {
            errors: [],
            warnings: []
        };
        for (const [_, issue] of this){
            const outputIssue = {
                severity: issue.severity,
                key: issue.key,
                code: CODE_DEPRECATED,
                additionalFileCount: 0,
                reason: issue.reason,
                files: Array.from(issue.files.values()).map((f)=>issueFile(issue, f)),
                helpUrl: issue.helpUrl
            };
            if (issue.severity === 'warning') {
                output.warnings.push(outputIssue);
            } else {
                output.errors.push(outputIssue);
            }
        }
        return output;
    }
}
export { DatasetIssues as DatasetIssues };

