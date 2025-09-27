import ThemeToggle from '@/components/ThemeToggle';

export default function ThemeTest() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <div className="container mx-auto p-8">
        {/* Header with Theme Toggle */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Theme Toggle Test
          </h1>
          <ThemeToggle />
        </div>

        {/* Test Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Card 1
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              This is a test card to demonstrate the theme switching functionality. 
              Notice how the colors change when you toggle the theme.
            </p>
            <button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Test Button
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Card 2
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Another test card with different elements to show the theme consistency 
              across various UI components.
            </p>
            <div className="flex space-x-2">
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm">
                Success
              </span>
              <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full text-sm">
                Warning
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-indigo-50 dark:bg-blue-900 border border-indigo-200 dark:border-blue-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-indigo-900 dark:text-blue-100 mb-2">
            🌓 Theme Toggle Instructions
          </h3>
          <ul className="text-indigo-700 dark:text-blue-200 space-y-2">
            <li>• Click the sun/moon icon in the top-right corner to toggle themes</li>
            <li>• The theme preference is automatically saved to localStorage</li>
            <li>• All colors, backgrounds, and borders should transition smoothly</li>
            <li>• Try refreshing the page - your theme choice should persist</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="inline-block bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            ← Back to Main App
          </a>
        </div>
      </div>
    </div>
  );
}
