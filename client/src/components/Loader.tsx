
// ...existing code...

const Loader = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      <img src="/pwa-512x512pwa-192x192.png" alt="App Logo" className="w-20 h-20 mb-4 animate-bounce" />
      <h1 className="text-2xl font-medium text-gray-700">MyTradingJournal</h1>
        <p className="text-gray-500 mt-2 animate-pulse">Loading, please wait...</p>
      <p  className="fixed bottom-4 text-center text-sm text-indigo-400 animate-pulse"> Powered by Hud3nTechology</p>
    </div>
  );
};

export default Loader;
