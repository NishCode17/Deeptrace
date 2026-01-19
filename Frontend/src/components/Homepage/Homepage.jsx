import React from "react";
import { useState, useEffect } from "react";
import { getUserDetails, getUserHistory } from "../../APIs/userDetails";
// import { fetchVideos, loadProvider } from "../../contractDeets";
import logo from '/src/assets/deeptrace_logo_transparent.png'


function Home() {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const userDetails = await getUserDetails();
      if (userDetails) setUser(userDetails);

      const userHistory = await getUserHistory();
      if (userHistory) setHistory(userHistory);
    };
    fetchData();
  }, []);

  if (!user) return <div className="h-screen flex justify-center items-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center py-16">
      <img src={logo} className='h-16 mb-8'></img>

      <div className="text-center mb-12">
        <div className="text-2xl text-gray-400 mb-2">Hello {user.username} 👋</div>
        <div className="text-5xl font-bold mb-8">Welcome to DeepTrace</div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              window.location.href = "/upload-video";
            }}
            className="px-8 py-3 bg-[#f1f3f5] text-[#1e1e1e] rounded-full font-bold text-xl hover:bg-[#ddd] transition-all transform hover:scale-105"
          >
            Test A Video
          </button>

          <button
            onClick={() => {
              window.location.href = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/logout`;
            }}
            className="px-8 py-3 bg-[#252525] text-[#f1f3f5] rounded-full font-bold text-xl border border-[#333] hover:bg-[#333] transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Previous Results Section */}
      <div className="w-full max-w-4xl px-4">
        <h2 className="text-3xl font-bold mb-6 border-b border-gray-800 pb-2">Previous Results</h2>

        {history.length === 0 ? (
          <div className="text-center text-gray-500 py-10 bg-[#1e1e1e] rounded-xl border border-[#333]">
            No previous analyses found. Try testing a video!
          </div>
        ) : (
          <div className="grid gap-4">
            {history.map((job) => (
              <div key={job._id} className="bg-[#1e1e1e] p-6 rounded-xl border border-[#333] flex justify-between items-center hover:border-gray-500 transition-colors">
                <div>
                  <div className="font-semibold text-lg mb-1 truncate w-64 md:w-96" title={job.filename}>
                    {job.filename.replace(/^\w+-/, '')} {/* Strip ID prefix if possible */}
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(job.createdAt).toLocaleDateString()} at {new Date(job.createdAt).toLocaleTimeString()}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${job.status === 'COMPLETED' ? 'bg-green-900/30 text-green-400' :
                    job.status === 'FAILED' ? 'bg-red-900/30 text-red-400' :
                      'bg-yellow-900/30 text-yellow-400'
                    }`}>
                    {job.status}
                  </div>

                  {job.status === 'COMPLETED' && job.result && (
                    <div className="text-right">
                      <div className={`text-xl font-bold ${job.result.mean_score < 0.5 ? 'text-green-500' : 'text-red-500'}`}>
                        {job.result.mean_score < 0.5 ? 'Real' : 'Deepfake'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {job.result.mean_score < 0.5
                          ? `Confidence: ${(100 - (job.result.mean_score * 100)).toFixed(1)}%`
                          : `Confidence: ${(job.result.mean_score * 100).toFixed(1)}%`}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
