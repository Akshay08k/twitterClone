import React from "react";

const ErrorBoundary = () => {
  return (
    <div>
      <div className="flex justify-center items-center font-mono text-3xl bg-black h-screen text-white">
        Something went wrong | 404
      </div>
    </div>
  );
};

export default ErrorBoundary;
