import { useState, useEffect } from "preact/hooks";

const ISSUE_TYPES = [
  { label: "Bug Report", color: "bug", description: "Something isn't working" },
  { label: "Feature Request", color: "enhancement", description: "Suggest an idea" },
  { label: "Question", color: "question", description: "Ask a question" }
];

const BUG_TEMPLATE = (data: any) => `
### Description
${data.description}

### Steps to Reproduce
${data.steps}

### Expected Behavior
${data.expected}

### Actual Behavior
${data.actual}

### Environment
- **Browser**: ${data.browser}
- **Operating System**: ${data.os}
- **Validator Version**: ${data.version}

${data.githubUsername ? `\nReported by: @${data.githubUsername}` : ''}
`;

const BASIC_TEMPLATE = (data: any) => `
### Description
${data.description}

### Additional Information
- **Browser**: ${data.browser}
- **Operating System**: ${data.os}
- **Validator Version**: ${data.version}

${data.githubUsername ? `\nReported by: @${data.githubUsername}` : ''}
`;

export default function IssueButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [issueType, setIssueType] = useState(ISSUE_TYPES[0].label);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [expected, setExpected] = useState('');
  const [actual, setActual] = useState('');
  const [browserInfo, setBrowserInfo] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedIssueUrl, setSubmittedIssueUrl] = useState('');

  const isBugReport = issueType === "Bug Report";

  useEffect(() => {
    setBrowserInfo(navigator.userAgent);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const templateData = {
      description,
      browser: browserInfo,
      os: navigator.platform,
      version: '1.0.0',
      steps,
      expected,
      actual,
      githubUsername
    };

    const body = isBugReport 
      ? BUG_TEMPLATE(templateData)
      : BASIC_TEMPLATE(templateData);
    
    try {
      const response = await fetch('/api/github/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title,
          body,
          labels: [issueType.toLowerCase()]
        })
      });

      if (response.ok) {
        const issueData = await response.json();
        setSubmittedIssueUrl(issueData.html_url);
        resetForm();
      } else {
        const errorData = await response.text();
        setError(`Failed to create issue: ${errorData}`);
      }
    } catch (err) {
      console.error('Failed to create issue:', err);
      setError('Failed to create issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSteps('');
    setExpected('');
    setActual('');
    setGithubUsername('');
    setIssueType(ISSUE_TYPES[0].label);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSubmittedIssueUrl('');
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        class="bg-blue-500 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded mb-1"
      >
        Provide Feedback
      </button>

      {isModalOpen && (
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 mb-1">
          <div class="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div class="p-6">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold">
                  {submittedIssueUrl ? 'Feedback Submitted' : 'Provide Feedback'}
                </h2>
                <button 
                  onClick={handleClose}
                  class="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {submittedIssueUrl ? (
                <div class="space-y-4">
                  <p>
                    Your feedback has been submitted successfully! You can view and track your issue at:
                  </p>
                  <a 
                    href={submittedIssueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-600 hover:text-blue-800 block break-all"
                  >
                    {submittedIssueUrl}
                  </a>
                  <p>
                    Feel free to make any additional comments or follow the issue through your GitHub account.
                  </p>
                  <button
                    onClick={handleClose}
                    class="w-full py-2 px-4 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium mb-1">Issue Type</label>
                    <select
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      class="w-full p-2 border rounded-md"
                    >
                      {ISSUE_TYPES.map((type) => (
                        <option key={type.label} value={type.label}>
                          {type.label} - {type.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      class="w-full p-2 border rounded-md"
                      placeholder="Brief summary of the issue"
                      required
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      class="w-full p-2 border rounded-md h-24"
                      placeholder="Detailed description of the issue"
                      required
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium mb-1">
                      GitHub Username (optional)
                    </label>
                    <input
                      type="text"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      class="w-full p-2 border rounded-md"
                      placeholder="username"
                    />
                  </div>

                  {isBugReport && (
                    <>
                      <div>
                        <label class="block text-sm font-medium mb-1">Steps to Reproduce</label>
                        <textarea
                          value={steps}
                          onChange={(e) => setSteps(e.target.value)}
                          class="w-full p-2 border rounded-md h-24"
                          placeholder="1. First step&#10;2. Second step&#10;3. ..."
                          
                        />
                      </div>

                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <label class="block text-sm font-medium mb-1">Expected Behavior</label>
                          <textarea
                            value={expected}
                            onChange={(e) => setExpected(e.target.value)}
                            class="w-full p-2 border rounded-md h-24"
                            placeholder="What should happen?"
                            
                          />
                        </div>

                        <div>
                          <label class="block text-sm font-medium mb-1">Actual Behavior</label>
                          <textarea
                            value={actual}
                            onChange={(e) => setActual(e.target.value)}
                            class="w-full p-2 border rounded-md h-24"
                            placeholder="What actually happened?"
                            
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {error && (
                    <div class="text-red-600 text-sm p-2 bg-red-50 rounded">
                      {error}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    class={`w-full py-2 px-4 rounded-md text-white font-medium 
                      ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {isSubmitting ? 'Creating...' : 'Submit Feedback'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}