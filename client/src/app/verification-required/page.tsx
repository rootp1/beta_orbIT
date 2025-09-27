import AutoDeepLink from '@/components/AutoDeepLink'

export default function VerificationRequiredPage() {
  const href = `worldapp://mini-app?app_id=${encodeURIComponent(process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID || '')}&path=${encodeURIComponent('/?autoverify=1')}`
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-8 text-center">
        <AutoDeepLink href={href} />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verification Required</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Please open this mini app inside World App and grant permission to verify your World ID.
        </p>
        <a
          href={href}
          className="inline-block w-full px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition"
        >
          Authorize
        </a>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          If you just granted permission, go back to the app and it will continue automatically.
        </p>
      </div>
    </div>
  )
}
