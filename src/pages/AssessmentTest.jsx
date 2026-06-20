import React, { useState, useEffect } from 'react';
import { assessmentService } from '../api/assessmentService';
import { extractError } from '../utils/extractError';
import { toastSuccess, alertError } from '../lib/alerts';

export default function AssessmentTest() {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  
  // Custom execution wrapper
  const executeCall = async (apiCall, successMsg) => {
    setLoading(true);
    setOutput(null);
    try {
      const response = await apiCall();
      setOutput(response.data);
      if (successMsg) toastSuccess(successMsg);
      return response.data;
    } catch (error) {
      const errMessage = extractError(error);
      setOutput({ error: errMessage, details: error.response?.data });
      alertError("Action Failed", errMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = () => executeCall(() => assessmentService.checkEligibility());
  
  const startAssessment = () => executeCall(() => assessmentService.startAssessment(), "Assessment Started!");
  
  const getCurrentStatus = () => executeCall(() => assessmentService.getCurrentStatus());
  
  const getHistory = () => executeCall(() => assessmentService.getHistory());
  
  const getNextQuestion = async () => {
    const data = await executeCall(() => assessmentService.getNextQuestion());
    if (data && data.data) {
      setCurrentQuestion(data.data);
      setSelectedAnswer(data.data.selectedAnswerIndex !== null ? data.data.selectedAnswerIndex : null);
    }
  };

  const getQuestionStatuses = () => executeCall(() => assessmentService.getQuestionStatuses());

  const submitAnswer = async () => {
    if (!currentQuestion) return alertError("No Question", "Load a question first.");
    if (selectedAnswer === null) return alertError("Validation", "Select an answer.");
    
    const data = await executeCall(() => 
      assessmentService.submitAnswer(currentQuestion.questionId, selectedAnswer, 15), 
      "Answer Submitted!"
    );
    if (data) {
      // Clear current question so the user is forced to fetch the next one
      setCurrentQuestion(null);
      setSelectedAnswer(null);
    }
  };

  const completeAssessment = () => executeCall(() => assessmentService.completeAssessment(), "Assessment Completed!");
  
  const abandonAssessment = () => executeCall(() => assessmentService.abandonAssessment(), "Assessment Abandoned!");

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 font-mono">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-blue-400 border-b border-slate-700 pb-4">
          Assessment Module Interactive Tester
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Actions Panel */}
          <div className="space-y-6 bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-slate-300">API Actions</h2>
            
            <div className="flex flex-wrap gap-3">
              <button disabled={loading} onClick={checkEligibility} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors disabled:opacity-50">
                1. Check Eligibility
              </button>
              <button disabled={loading} onClick={startAssessment} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-sm transition-colors disabled:opacity-50">
                2. Start Assessment
              </button>
              <button disabled={loading} onClick={getCurrentStatus} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded text-sm transition-colors disabled:opacity-50">
                3. Get Current Status
              </button>
              <button disabled={loading} onClick={getQuestionStatuses} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-sm transition-colors disabled:opacity-50">
                4. Get Question Statuses
              </button>
              <button disabled={loading} onClick={getNextQuestion} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded text-sm transition-colors disabled:opacity-50">
                5. Get Next Question
              </button>
              <button disabled={loading} onClick={completeAssessment} className="px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded text-sm transition-colors disabled:opacity-50">
                6. Complete Assessment
              </button>
              <button disabled={loading} onClick={abandonAssessment} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-sm transition-colors disabled:opacity-50">
                7. Abandon Assessment
              </button>
              <button disabled={loading} onClick={getHistory} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded text-sm transition-colors disabled:opacity-50">
                8. Get History
              </button>
            </div>

            {/* Active Question Panel */}
            {currentQuestion && (
              <div className="mt-8 p-4 bg-slate-700 rounded border border-slate-600">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-amber-400">Active Question</h3>
                  <span className="text-xs bg-slate-800 px-2 py-1 rounded">
                    Q{currentQuestion.questionNumber} of {currentQuestion.totalQuestions}
                  </span>
                </div>
                
                <p className="text-sm mb-4 leading-relaxed">{currentQuestion.questionText}</p>
                
                <div className="space-y-2 mb-4">
                  {currentQuestion.options.map((opt, idx) => (
                    <label key={idx} className="flex items-center gap-3 p-3 bg-slate-800 rounded cursor-pointer hover:bg-slate-750 border border-slate-600 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-900/30">
                      <input 
                        type="radio" 
                        name="answerOption" 
                        value={idx}
                        checked={selectedAnswer === idx}
                        onChange={() => setSelectedAnswer(idx)}
                        className="text-blue-500 w-4 h-4"
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>

                <button 
                  disabled={loading} 
                  onClick={submitAnswer} 
                  className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded shadow transition-colors disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Answer'}
                </button>
              </div>
            )}
          </div>

          {/* Output Panel */}
          <div className="bg-black/50 p-6 rounded-xl border border-slate-700 flex flex-col h-[800px]">
            <h2 className="text-xl font-semibold mb-4 text-emerald-400 flex items-center justify-between">
              <span>Response JSON</span>
              {loading && <span className="text-xs animate-pulse text-slate-400">Loading...</span>}
            </h2>
            <div className="flex-1 overflow-auto bg-slate-900 p-4 rounded border border-slate-800">
              <pre className="text-xs text-green-400 whitespace-pre-wrap font-mono leading-relaxed">
                {output ? JSON.stringify(output, null, 2) : '// No response yet. Click an action button to test the API.'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
