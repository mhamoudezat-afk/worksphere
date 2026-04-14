export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="relative">
        <div className="w-16 h-16 rounded-full absolute border-4 border-solid border-gray-700"></div>
        <div className="w-16 h-16 rounded-full animate-spin absolute border-4 border-solid border-purple-500 border-t-transparent"></div>
      </div>
    </div>
  );
}