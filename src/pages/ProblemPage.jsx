import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import ChatAi from '../components/ChatAi';
import VideoPlayer from '../components/VideoPlayer';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript'
};

const ProblemPage = () => {
  const { problemId } = useParams();
  const editorRef = useRef(null);

  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');

  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');

  const [loadingProblem, setLoadingProblem] = useState(false);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);

  /* ---------------- FETCH PROBLEM ---------------- */
  useEffect(() => {
    const fetchProblem = async () => {
      setLoadingProblem(true);
      try {
        const res = await axiosClient.get(`/problem/${problemId}`);
        setProblem(res.data);

        // Get initial code for the selected language
        const initialCode = res.data.startCode?.find(
          sc => sc.language === langMap[selectedLanguage]
        )?.initialCode || '';

        setCode(initialCode);
      } catch (err) {
        console.error("Fetch problem error:", err.response || err.message);
      } finally {
        setLoadingProblem(false);
      }
    };

    fetchProblem();
  }, [problemId, selectedLanguage]);

  /* ---------------- RUN CODE ---------------- */
  const handleRun = async () => {
    if (!code) return;
    setRunning(true);
    setRunResult(null);

    try {
      const res = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });
      setRunResult(res.data);
      setActiveRightTab('testcase');
    } catch (err) {
      console.error("Run code error:", err.response || err.message);
      setRunResult({ success: false, error: "Run failed" });
      setActiveRightTab('testcase');
    } finally {
      setRunning(false);
    }
  };

  /* ---------------- SUBMIT CODE ---------------- */
  const handleSubmitCode = async () => {
    if (!code) return;
    setSubmitting(true);
    setSubmitResult(null);

    try {
      const res = await axiosClient.post(`/submission/submit/${problemId}`, {
        code,
        language: selectedLanguage
      });
      setSubmitResult(res.data);
      setActiveRightTab('result');
    } catch (err) {
      console.error("Submit code error:", err.response || err.message);
      setSubmitResult({
        accepted: false,
        error: "Submission Failed",
        passedTestCases: 0,
        totalTestCases: problem?.hiddenTestCases?.length || 0
      });
      setActiveRightTab('result');
    } finally {
      setSubmitting(false);
    }
  };

  const getLanguageForMonaco = () => {
    if (selectedLanguage === 'cpp') return 'cpp';
    if (selectedLanguage === 'java') return 'java';
    return 'javascript';
  };

  if (loadingProblem) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="h-screen flex">

      {/* LEFT PANEL */}
      <div className="w-1/2 border-r">
        <div className="tabs tabs-bordered px-4">
          {['description', 'editorial', 'solutions', 'submissions', 'chatAI'].map(tab => (
            <button
              key={tab}
              className={`tab ${activeLeftTab === tab ? 'tab-active' : ''}`}
              onClick={() => setActiveLeftTab(tab)}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto">
          {activeLeftTab === 'description' && problem && (
            <>
              <h1 className="text-2xl font-bold">{problem.title}</h1>
              <p className="mt-4 whitespace-pre-wrap">{problem.description}</p>
            </>
          )}

          {activeLeftTab === 'editorial' && (
            <VideoPlayer videoUrl={problem?.secureUrl} />
          )}

          {activeLeftTab === 'solutions' && (
            <>
              {problem.referenceSolution?.map((sol, idx) => (
                <div key={idx} className="border rounded mb-4">
                  <div className="bg-base-200 p-2 font-semibold">{sol.language}</div>
                  <pre className="p-4 bg-base-300 overflow-x-auto">
                    {sol.completeCode}
                  </pre>
                </div>
              )) || <p className="text-gray-500">Solutions will appear after solving the problem.</p>}
            </>
          )}

          {activeLeftTab === 'submissions' && <SubmissionHistory problemId={problemId} />}

          {activeLeftTab === 'chatAI' && <ChatAi problem={problem} />}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-1/2 flex flex-col">
        <div className="tabs tabs-bordered px-4">
          {['code', 'testcase', 'result'].map(tab => (
            <button
              key={tab}
              className={`tab ${activeRightTab === tab ? 'tab-active' : ''}`}
              onClick={() => setActiveRightTab(tab)}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {activeRightTab === 'code' && (
          <>
            <div className="p-4 flex gap-2">
              {['javascript', 'java', 'cpp'].map(lang => (
                <button
                  key={lang}
                  className={`btn btn-sm ${selectedLanguage === lang ? 'btn-primary' : ''}`}
                  onClick={() => setSelectedLanguage(lang)}
                >
                  {lang}
                </button>
              ))}
            </div>

            <Editor
              height="100%"
              theme="vs-dark"
              language={getLanguageForMonaco()}
              value={code}
              onChange={val => setCode(val || '')}
              onMount={editor => (editorRef.current = editor)}
            />

            <div className="p-4 flex justify-end gap-2">
              <button className="btn btn-outline" onClick={handleRun} disabled={running}>
                Run
              </button>
              <button className="btn btn-primary" onClick={handleSubmitCode} disabled={submitting}>
                Submit
              </button>
            </div>
          </>
        )}

        {activeRightTab === 'testcase' && (
          <div className="flex-1 p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4">Test Cases</h3>

            {problem?.visibleTestCases?.map((tc, idx) => (
              <div key={idx} className="border rounded mb-4">
                <div className="bg-base-200 p-2 font-semibold">Test Case {idx + 1}</div>
                <div className="p-2">
                  <p className="text-sm font-semibold">Input</p>
                  <pre className="bg-base-300 p-2 rounded">{tc.input}</pre>
                  <p className="text-sm font-semibold">Expected Output</p>
                  <pre className="bg-base-300 p-2 rounded">{tc.output}</pre>
                </div>
              </div>
            ))}

            {runResult && (
              <div className={`alert ${runResult.success ? 'alert-success' : 'alert-error'}`}>
                <pre>{runResult.success ? runResult.output : runResult.error}</pre>
              </div>
            )}
          </div>
        )}

        {activeRightTab === 'result' && (
          <div className="flex-1 p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4">Submission Result</h3>
            {submitResult ? (
              <div className={`alert ${submitResult.accepted ? 'alert-success' : 'alert-error'}`}>
                {submitResult.accepted ? (
                  <>
                    <h4 className="font-bold text-lg">🎉 Accepted</h4>
                    <p>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                    <p>Runtime: {submitResult.runtime} sec</p>
                    <p>Memory: {submitResult.memory} KB</p>
                  </>
                ) : (
                  <>
                    <h4 className="font-bold text-lg">❌ {submitResult.error || 'Wrong Answer'}</h4>
                    <p>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                  </>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Click "Submit" to submit your solution for evaluation.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemPage;
