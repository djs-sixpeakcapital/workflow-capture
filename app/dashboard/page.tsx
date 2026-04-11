"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface WorkflowTask {
  id: string;
  task_name: string;
  inputs: string;
  outputs: string;
  frequency: string;
  time_spent: string;
  handed_to: string;
  submitted_by: string;
  created_at: string;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      const { data, error } = await supabase
        .from("workflow_tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setTasks(data);
      }
      setLoading(false);
    }
    fetchTasks();
  }, []);

  return (
    <main className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Workflow Dashboard</h1>
        <p className="text-gray-600 mb-8">
          All submitted workflow tasks across the team.
        </p>

        {loading ? (
          <p className="text-gray-500">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No tasks submitted yet. Head to the form to add your first task.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inputs</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outputs</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Spent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Handed To</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{task.submitted_by}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{task.task_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{task.inputs}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{task.outputs}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{task.frequency}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{task.time_spent}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{task.handed_to}</td>
                    <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                      {new Date(task.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
