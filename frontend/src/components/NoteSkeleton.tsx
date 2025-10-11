export default function NoteSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    </div>
  );
}