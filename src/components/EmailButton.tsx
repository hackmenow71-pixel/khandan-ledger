"use client";

import { useState, useTransition } from "react";
import { sendExpenseAlerts } from "@/app/actions/expenses";

export function EmailButton() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', msg: string }>({ type: 'idle', msg: '' });

  const handleSend = () => {
    startTransition(async () => {
      const result = await sendExpenseAlerts();
      if (result.success) {
        setStatus({ type: 'success', msg: result.message });
      } else {
        setStatus({ type: 'error', msg: result.message });
      }
      setTimeout(() => setStatus({ type: 'idle', msg: '' }), 5000);
    });
  };

  return (
    <div className="flex items-center gap-2">
      {status.msg && (
        <span className={`text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {status.msg}
        </span>
      )}
      <button
        onClick={handleSend}
        disabled={isPending}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium text-sm transition disabled:opacity-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        {isPending ? "Sending..." : "Test Email Alert"}
      </button>
    </div>
  );
}
