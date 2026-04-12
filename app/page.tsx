"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const FREQUENCY_OPTIONS = ["Daily", "Weekly", "Monthly", "As Needed"];

interface Step {
  step_name: string;
  inputs: string;
  outputs: string;
  time_spent: string;
  handed_to: string;
}

const EMPTY_STEP: Step = {
  step_name: "",
  inputs: "",
  outputs: "",
  time_spent: "",
  handed_to: "",
};

export default function Home() {
  const [workflowName, setWorkflowName] = useState("");
  const [submittedBy, setSubmittedBy] = useState("");
  const [role, setRole] = useState("");
  const [frequency, setFrequency] = useState("");
  const [steps, setSteps] = useState<Step[]>([{ ...EMPTY_STEP }]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function updateStep(index: number, field: keyof Step, value: string) {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  }

  function addStep() {
    setSteps([...steps, { ...EMPTY_STEP }]);
  }

  function removeStep(index: number) {
    setSteps(steps.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    // Insert the workflow
    const { data: workflow, error: wfError } = await supabase
      .from("workflows")
      .insert([{ workflow_name: workflowName, submitted_by: submittedBy, role, frequency }])
      .select("id")
      .single();

    if (wfError || !workflow) {
      setStatus("error");
      setErrorMsg(wfError?.message || "Failed to create workflow");
      return;
    }

    // Insert all steps
    const stepsToInsert = steps.map((step, i) => ({
      workflow_id: workflow.id,
      step_number: i + 1,
      ...step,
    }));

    const { error: stepsError } = await supabase
      .from("workflow_steps")
      .insert(stepsToInsert);

    if (stepsError) {
      setStatus("error");
      setErrorMsg(stepsError.message);
      return;
    }

    setStatus("success");
    setWorkflowName("");
    setSubmittedBy("");
    setRole("");
    setFrequency("");
    setSteps([{ ...EMPTY_STEP }]);
    setTimeout(() => setStatus("idle"), 3000);
  }

  return (
    <main className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Log a Workflow</h1>
        <p className="text-gray-600 mb-8">
          Describe a workflow you perform regularly. Add as many steps as needed to capture the full process.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Workflow-level fields */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-5">
            <div>
              <label htmlFor="submitted_by" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                id="submitted_by"
                type="text"
                required
                value={submittedBy}
                onChange={(e) => setSubmittedBy(e.target.value)}
                placeholder="e.g. Grady Lakamp"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Your Role / Position
              </label>
              <input
                id="role"
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Assistant PM"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="workflow_name" className="block text-sm font-medium text-gray-700 mb-1">
                Workflow Name
              </label>
              <input
                id="workflow_name"
                type="text"
                required
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="e.g. Subcontractor Invoice Review & Coding"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <select
                id="frequency"
                required
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select frequency...</option>
                {FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Steps</h2>

            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-600">
                    Step {index + 1}
                  </span>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Step Name
                  </label>
                  <input
                    type="text"
                    required
                    value={step.step_name}
                    onChange={(e) => updateStep(index, "step_name", e.target.value)}
                    placeholder="e.g. Download invoice & save to Box"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Inputs
                    </label>
                    <textarea
                      rows={2}
                      value={step.inputs}
                      onChange={(e) => updateStep(index, "inputs", e.target.value)}
                      placeholder="What do you need for this step?"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Outputs
                    </label>
                    <textarea
                      rows={2}
                      value={step.outputs}
                      onChange={(e) => updateStep(index, "outputs", e.target.value)}
                      placeholder="What does this step produce?"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time Spent
                    </label>
                    <input
                      type="text"
                      value={step.time_spent}
                      onChange={(e) => updateStep(index, "time_spent", e.target.value)}
                      placeholder="e.g. 15 min"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Handed To
                    </label>
                    <input
                      type="text"
                      value={step.handed_to}
                      onChange={(e) => updateStep(index, "handed_to", e.target.value)}
                      placeholder="Who gets the output?"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addStep}
              className="w-full rounded-md border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              + Add Step
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading" ? "Submitting..." : "Submit Workflow"}
          </button>

          {status === "success" && (
            <p className="text-sm text-green-600 text-center">Workflow submitted successfully!</p>
          )}
          {status === "error" && (
            <p className="text-sm text-red-600 text-center">Error: {errorMsg}</p>
          )}
        </form>
      </div>
    </main>
  );
}
