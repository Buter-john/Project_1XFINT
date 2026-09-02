import React from "react";
import { AlertCircle } from "lucide-react";

interface AlertProps {
  title: string;
  error: string;
}

const AlertMessage: React.FC<AlertProps> = ({ title, error }) => {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
      <AlertCircle size={18} className="shrink-0 mt-0.5" />
      <div>
        <strong className="font-semibold">{title}</strong>
        <p>{error}</p>
      </div>
    </div>
  );
};

export default AlertMessage;