interface AlertProps {
  message: string;
  onClose?: () => void;
}

export function ErrorAlert({ message, onClose }: AlertProps) {
  if (!message) return null;
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 mb-4">
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="font-bold text-red-600 hover:text-red-900 leading-none mt-0.5">
          ✕
        </button>
      )}
    </div>
  );
}

export function SuccessAlert({ message, onClose }: AlertProps) {
  if (!message) return null;
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800 mb-4">
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="font-bold text-green-600 hover:text-green-900 leading-none mt-0.5">
          ✕
        </button>
      )}
    </div>
  );
}
