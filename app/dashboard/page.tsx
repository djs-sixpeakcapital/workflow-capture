"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface WorkflowStep {
  id: string;
  step_number: number;
  step_name: string;
  inputs: string;
  outputs: string;
  time_spent: string;
  handed_to: string;
}

interface Workflow {
  id: string;
  workflow_name: string;
  submitted_by: string;
  frequency: string;
  created_at: string;
  workflow_steps: WorkflowStep[];
}

export default function Dashboard() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchWorkflows() {
      const { data, error } = await supabase
        .from("workflows")
        .select("*, workflow_steps(*)")
        .order("created_at", { ascending: false });

      if (!error && data) {
        // Sort steps within each workflow
        const sorted = data.map((wf: Workflow) => ({
          ...wf,
          workflow_steps: (wf.workflow_steps || []).sort(
            (a: WorkflowStep, b: WorkflowStep) => a.step_number - b.step_number
          ),
        }));
        setWorkflows(sorted);
      }
      setLoading(false);
    }
    fetchWorkflows();
  }, []);

  function toggleExpand(id: string) {
    const next = new Set(expanded);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpanded(next);
  }

  return (
    <main className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Workflow Dashboard</h1>
        <p className="text-gray-600 mb-8">
          All submitted workflows across the team. Click a workflow to see its steps.
        </p>

        {loading ? (
          <p className="text-gray-500">Loading workflows...</p>
        ) : workflows.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No workflows submitted yet. Head to the form to add your first workflow.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workflows.map((wf) => {
              const isOpen = expanded.has(wf.id);
              return (
                <div
                  key={wf.id}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
                >
                  {/* Card header */}
                  <button
                    onClick={() => toggleExpand(wf.id)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {wf.workflow_name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {wf.submitted_by} &middot; {wf.frequency} &middot;{" "}
                        {new Date(wf.created_at).toLocaleDateString()} &middot;{" "}
                        {wf.workflow_steps.length} step{wf.workflow_steps.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded steps */}
                  {isOpen && (
                    <div className="border-t border-gray-200 px-5 py-4">
                      <div className="space-y-3">
                        {wf.workflow_steps.map((step, i) => (
                          <div key={step.id} className="flex gap-3">
                            {/* Step number connector */}
                            <div className="flex flex-col items-center">
                              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                                {step.step_number}
                              </div>
                              {i < wf.workflow_steps.length - 1 && (
                                <div className="w-px flex-1 bg-blue-200 mt-1" />
                              )}
                            </div>

                            {/* Step details */}
                            <div className="pb-4 flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {step.step_name}
                              </p>
                              <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
                                {step.inputs && (
                                  <p><span className="font-medium text-gray-600">Inputs:</span> {step.inputs}</p>
                                )}
                                {step.outputs && (
                                  <p><span className="font-medium text-gray-600">Outputs:</span> {step.outputs}</p>
                                )}
                                {step.time_spent && (
                                  <p><span className="font-medium text-gray-600">Time:</span> {step.time_spent}</p>
                                )}
                                {step.handed_to && (
                                  <p><span className="font-medium text-gray-600">Handed to:</span> {step.handed_to}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
