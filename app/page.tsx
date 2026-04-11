"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const FREQUENCY_OPTIONS = ["Daily", "Weekly", "Monthly", "As Needed"];

export default function Home() {
  const [form, setForm] = useState({
    task_name: "",
    inputs: "",
    outputs: "",
    frequency: "",
    time_spent: "",
    handed_to: "",
    submitted_by: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const { error } = await supabase.from("workflow_tasks").insert([form]);

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("success");
      setForm({
        task_name: "",
        inputs: "",
        outputs: "",
        frequency: "",
        time_spent: "",
        handed_to: "",
        submitted_by: "",
      });
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <main className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Log a Workflow Task</h1>
        <p className="text-gray-600 mb-8">
          Describe a task you perform regularly so we can map how work flows through the team.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          {/* Submitted By */}
          <div>
            <label htmlFor="submitted_by" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              id="submitted_by"
              name="submitted_by"
              type="text"
              required
              value={form.submitted_by}
              onChange={handleChange}
              placeholder="e.g. Derek Sanders"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Task Name */}
          <div>
            <label htmlFor="task_name" className="block text-sm font-medium text-gray-700 mb-1">
              Task Name
            </label>
            <input
              id="task_name"
              name="task_name"
              type="text"
              required
              value={form.task_name}
              onChange={handleChange}
              placeholder="e.g. Review daily subcontractor reports"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Inputs */}
          <div>
            <label htmlFor="inputs" className="block text-sm font-medium text-gray-700 mb-1">
              Inputs
            </label>
            <textarea
              id="inputs"
              name="inputs"
              rows={2}
              value={form.inputs}
              onChange={handleChange}
              placeholder="What do you need to start this task? (e.g. daily logs from GC, email reports)"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Outputs */}
          <div>
            <label htmlFor="outputs" className="block text-sm font-medium text-gray-700 mb-1">
              Outputs
            </label>
            <textarea
              id="outputs"
              name="outputs"
              rows={2}
              value={form.outputs}
              onChange={handleChange}
              placeholder="What does this task produce? (e.g. updated tracker spreadsheet, email summary)"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Frequency */}
          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
              Frequency
            </label>
            <select
              id="frequency"
              name="frequency"
              required
              value={form.frequency}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select frequency...</option>
              {FREQUENCY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Time Spent */}
          <div>
            <label htmlFor="time_spent" className="block text-sm font-medium text-gray-700 mb-1">
              Time Spent
            </label>
            <input
              id="time_spent"
              name="time_spent"
              type="text"
              value={form.time_spent}
              onChange={handleChange}
              placeholder="e.g. 30 min, 2 hours"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Handed To */}
          <div>
            <label htmlFor="handed_to" className="block text-sm font-medium text-gray-700 mb-1">
              Handed To
            </label>
            <input
              id="handed_to"
              name="handed_to"
              type="text"
              value={form.handed_to}
              onChange={handleChange}
              placeholder="Who receives the output of this task? (e.g. Chris Aiello)"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading" ? "Submitting..." : "Submit Task"}
          </button>

          {status === "success" && (
            <p className="text-sm text-green-600 text-center">Task submitted successfully!</p>
          )}
          {status === "error" && (
            <p className="text-sm text-red-600 text-center">Error: {errorMsg}</p>
          )}
        </form>
      </div>
    </main>
  );
}
