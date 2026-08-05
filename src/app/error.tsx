"use client";
type ErrorProps = {
  error: Error;
};

export default function Error({ error }: ErrorProps) {
  return (
    <div className="flex h-screen flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-8">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
        <span className="text-2xl">⚠️</span>
      </div>

      <h2 className="text-xl font-semibold text-red-700">
        Something went wrong
      </h2>

      <p className="mt-2 max-w-md text-center text-sm text-red-600">
        {error.message || "An unexpected error occurred."}
      </p>

      <button
        onClick={() => window.location.reload()}
        className="mt-6 rounded-lg bg-red-600 px-5 py-2 text-white transition hover:bg-red-700"
      >
        Try Again
      </button>
    </div>
  );
}
