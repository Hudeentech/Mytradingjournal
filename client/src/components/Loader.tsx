
// ...existing code...

const Loader = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      <div className="flex flex-col items-center">
        {/* Luxury Logo Container */}
        <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
          {/* Subtle outer spin ring */}
          <div className="absolute inset-0 rounded-full border-[3px] border-gray-100 border-t-black animate-spin" style={{ animationDuration: '1.5s' }}></div>

          {/* Inner pulse ring */}
          <div className="absolute inset-2 rounded-full border border-gray-200 animate-pulse"></div>

          {/* Logo */}
          <img
            src="/pwa-512x512pwa-192x192.png"
            alt="App Logo"
            className="w-16 h-16 drop-shadow-xl animate-pulse grayscale"
          />
        </div>

        {/* Typography */}
        <h1 className="text-2xl font-bold tracking-widest text-gray-900 uppercase">
          MyTradingJournal
        </h1>

        {/* Loading text with progressive dots */}
        <div className="mt-4 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-10 flex flex-col items-center">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">Powered By</p>
        <p className="text-sm font-bold tracking-wider text-gray-800">Hud3nTechology</p>
      </div>
    </div>
  );
};

export default Loader;
