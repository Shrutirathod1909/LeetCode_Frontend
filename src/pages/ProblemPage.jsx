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
        const res = await axiosClient.get(`/problem/problemById/${problemId}`);
        setProblem(res.data);

        const initialCode = res.data.startCode.find(
          sc => sc.language === langMap[selectedLanguage]
        )?.initialCode || '';

        setCode(initialCode);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProblem(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  /* -------- UPDATE CODE ON LANGUAGE CHANGE -------- */
  useEffect(() => {
    if (!problem) return;
    const initialCode = problem.startCode.find(
      sc => sc.language === langMap[selectedLanguage]
    )?.initialCode || '';
    setCode(initialCode);
  }, [selectedLanguage, problem]);

  /* ---------------- RUN CODE ---------------- */
  const handleRun = async () => {
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
      setRunResult({ success: false, error: 'Run failed' });
      setActiveRightTab('testcase');
    } finally {
      setRunning(false);
    }
  };

  /* ---------------- SUBMIT CODE ---------------- */
 const handleSubmitCode = async () => {
  setSubmitting(true);
  setSubmitResult(null);

  try {
    const res = await axiosClient.post(
      `/submission/submit/${problemId}`,
      {
        code,
        language: selectedLanguage
      }
    );

    setSubmitResult(res.data); // ✅ accepted exists now
    setActiveRightTab('result');

  } catch (err) {
    setSubmitResult({
      accepted: false,
      error: "Submission Failed",
      passedTestCases: 0,
      totalTestCases: 0
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
            <>
              <h2 className="text-xl font-bold">Editorial</h2>
              <VideoPlayer videoUrl={problem?.secureUrl} />
            </>
          )}

         {activeLeftTab === 'solutions' && (
  <div>
    <h2 className="text-xl font-bold mb-4">Solutions</h2>
    <div className="space-y-6">
      {problem.referenceSolution?.map((solution, index) => (
        <div key={index} className="border border-base-300 rounded-lg">
          <div className="bg-base-200 px-4 py-2 rounded-t-lg">
            <h3 className="font-semibold">
              {problem?.title} - {solution?.language}
            </h3>
          </div>
          <div className="p-4">
            <pre className="bg-base-300 p-4 rounded text-sm overflow-x-auto">
              <code>{solution?.completeCode}</code>
            </pre>
          </div>
        </div>
      )) || (
        <p className="text-gray-500">
          Solutions will be available after you solve the problem.
        </p>
      )}
    </div>
  </div>
)}


          {activeLeftTab === 'submissions' && (
            <SubmissionHistory problemId={problemId} />
          )}

          {activeLeftTab === 'chatAI' && (
            <ChatAi problem={problem} />
          )}
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
        

        {/* CODE TAB */}
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


{/* TESTCASE TAB */}
{activeRightTab === 'testcase' && (
  <div className="flex-1 p-4 overflow-y-auto">
    <h3 className="font-semibold mb-4">Test Cases</h3>

    {/* Show Visible Test Cases */}
    {problem?.visibleTestCases

      ?.filter(tc => !tc.isHidden)
      .map((tc, index) => (
        <div
          key={index}
          className="border border-base-300 rounded-lg mb-4"
        >
          <div className="bg-base-200 px-4 py-2 font-semibold">
            Test Case {index + 1}
          </div>

          <div className="p-4 space-y-2">
            <div>
              <p className="text-sm font-semibold">Input</p>
              <pre className="bg-base-300 p-2 rounded">
                {tc.input}
              </pre>
            </div>

            <div>
              <p className="text-sm font-semibold">Expected Output</p>
              <pre className="bg-base-300 p-2 rounded">
                {tc.output}
              </pre>
            </div>
          </div>
        </div>
      ))}

    {/* Run Output */}
    {runResult && (
      <div className="mt-6">
        <h4 className="font-semibold mb-2">Run Result</h4>

        {runResult.success ? (
          <div className="alert alert-success">
            <div>
              <p>✅ Code executed successfully</p>
              <pre className="mt-2 bg-base-300 p-2 rounded">
                {runResult.output}
              </pre>
            </div>
          </div>
        ) : (
          <div className="alert alert-error">
            <p>❌ {runResult.error}</p>
          </div>
        )}
      </div>
    )}
  </div>
)}






        {/* RESULT TAB */}
     {activeRightTab === 'result' && (
  <div className="flex-1 p-4 overflow-y-auto">
    <h3 className="font-semibold mb-4">Submission Result</h3>

    {submitResult ? (
      <div
        className={`alert ${
          submitResult.accepted ? 'alert-success' : 'alert-error'
        }`}
      >
        <div>
          {submitResult.accepted ? (
            <>
              <h4 className="font-bold text-lg">🎉 Accepted</h4>
              <p>
                Test Cases Passed:
                {submitResult.passedTestCases}/
                {submitResult.totalTestCases}
              </p>
              <p>Runtime: {submitResult.runtime} sec</p>
              <p>Memory: {submitResult.memory} KB</p>
            </>
          ) : (
            <>
              <h4 className="font-bold text-lg">
                ❌ {submitResult.error || "Wrong Answer"}
              </h4>
              <p>
                Test Cases Passed:
                {submitResult.passedTestCases}/
                {submitResult.totalTestCases}
              </p>
            </>
          )}
        </div>
      </div>
    ) : (
      <div className="text-gray-500">
        Click \"Submit\" to submit your solution for evaluation.
      </div>
    )}
  </div>
)}


      </div>
    </div>
  );
};

export default ProblemPage;