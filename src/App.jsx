import { useState } from "react";
import {
  Trophy,
  Users,
  GitFork,
  Star,
  Calendar,
  Code,
  Activity,
  Award,
} from "lucide-react";
import { Visitor } from "./Visitor";

const App = () => {
  const [userA, setUserA] = useState("");
  const [userB, setUserB] = useState("");
  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);
  const [reposA, setReposA] = useState([]);
  const [reposB, setReposB] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUserData = async (username) => {
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    if (!userRes.ok) throw new Error(`User ${username} not found`);
    const userData = await userRes.json();

    const repoRes = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`
    );
    const reposData = await repoRes.json();

    return { user: userData, repos: reposData };
  };

  const handleCompare = async () => {
    if (!userA.trim() || !userB.trim()) return;

    try {
      setLoading(true);
      setError("");
      const [a, b] = await Promise.all([
        fetchUserData(userA.trim()),
        fetchUserData(userB.trim()),
      ]);
      setDataA(a.user);
      setDataB(b.user);
      setReposA(a.repos);
      setReposB(b.repos);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getAdvancedStats = (repos, userData) => {
    const stars = repos.reduce((acc, r) => acc + r.stargazers_count, 0);
    const forks = repos.reduce((acc, r) => acc + r.forks_count, 0);
    const langs = repos.reduce((acc, r) => {
      if (r.language) acc[r.language] = (acc[r.language] || 0) + 1;
      return acc;
    }, {});

    const topLang =
      Object.entries(langs).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    const recentActivity = repos.filter((r) => {
      const lastUpdate = new Date(r.updated_at);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return lastUpdate > sixMonthsAgo;
    }).length;

    const avgStarsPerRepo =
      repos.length > 0 ? Math.round((stars / repos.length) * 10) / 10 : 0;
    const followerRatio =
      userData.following > 0
        ? Math.round((userData.followers / userData.following) * 100) / 100
        : userData.followers;

    return {
      stars,
      forks,
      topLang,
      recentActivity,
      avgStarsPerRepo,
      followerRatio,
      totalLangs: Object.keys(langs).length,
    };
  };

  const calculateOverallScore = (userData, stats) => {
    const followerScore = Math.min(userData.followers / 10, 100);
    const starScore = Math.min(stats.stars / 5, 100);
    const repoScore = Math.min(userData.public_repos / 2, 100);
    const activityScore = Math.min(stats.recentActivity * 5, 100);
    const diversityScore = Math.min(stats.totalLangs * 10, 100);

    return Math.round(
      (followerScore + starScore + repoScore + activityScore + diversityScore) /
        5
    );
  };

  const StatCard = ({
    icon: Icon,
    label,
    valueA,
    valueB,
    isHigherBetter = true,
    formatValue = (v) => v,
  }) => {
    const numA = typeof valueA === "number" ? valueA : 0;
    const numB = typeof valueB === "number" ? valueB : 0;

    let winnerA = false,
      winnerB = false;
    if (numA !== numB) {
      winnerA = isHigherBetter ? numA > numB : numA < numB;
      winnerB = isHigherBetter ? numB > numA : numB < numA;
    }

    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
        <div
          className={`flex items-center space-x-3 ${
            winnerA ? "text-green-600 font-semibold" : "text-gray-700"
          }`}
        >
          {winnerA && <Trophy className="w-4 h-4 text-yellow-500" />}
          <span className="text-lg">{formatValue(valueA)}</span>
        </div>

        <div className="flex items-center space-x-2 text-gray-600">
          <Icon className="w-5 h-5" />
          <span className="font-medium">{label}</span>
        </div>

        <div
          className={`flex items-center space-x-3 ${
            winnerB ? "text-green-600 font-semibold" : "text-gray-700"
          }`}
        >
          <span className="text-lg">{formatValue(valueB)}</span>
          {winnerB && <Trophy className="w-4 h-4 text-yellow-500" />}
        </div>
      </div>
    );
  };

  const UserCard = ({ userData, stats, score, isWinner }) => (
    <div
      className={`bg-white rounded-xl p-6 shadow-lg border-2 transition-all ${
        isWinner ? "border-yellow-500 shadow-xl scale-105" : "border-gray-200"
      }`}
    >
      {isWinner && (
        <div className="flex items-center justify-center mb-4">
          <div className="bg-yellow-500 text-white px-4 py-2 rounded-full flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span className="font-bold">WINNER</span>
          </div>
        </div>
      )}

      <div className="text-center mb-4">
        <img
          src={userData.avatar_url}
          alt={userData.login}
          className="w-24 h-24 rounded-full mx-auto border-4 border-blue-500 shadow-lg"
        />
        <h3 className="mt-3 text-xl font-bold text-gray-800">
          {userData.name || userData.login}
        </h3>
        <p className="text-gray-600">@{userData.login}</p>
        {userData.bio && (
          <p className="text-sm text-gray-500 mt-2 italic">"{userData.bio}"</p>
        )}
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg text-center">
        <div className="text-3xl font-bold">{score}</div>
        <div className="text-sm opacity-90">Overall Score</div>
      </div>
    </div>
  );

  const statsA = dataA ? getAdvancedStats(reposA, dataA) : null;
  const statsB = dataB ? getAdvancedStats(reposB, dataB) : null;
  const scoreA = dataA && statsA ? calculateOverallScore(dataA, statsA) : 0;
  const scoreB = dataB && statsB ? calculateOverallScore(dataB, statsB) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3">
      <Visitor />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Git<span className="text-blue-600">Compare</span>
          </h1>
          <p className="text-xl text-gray-600">
            Compare GitHub developers side by side
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <input
              type="text"
              placeholder="Enter first GitHub username"
              className="px-6 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none w-full md:w-64"
              value={userA}
              onChange={(e) => setUserA(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCompare()}
            />

            <div className="text-2xl font-bold text-gray-400">VS</div>

            <input
              type="text"
              placeholder="Enter second GitHub username"
              className="px-6 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none w-full md:w-64"
              value={userB}
              onChange={(e) => setUserB(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCompare()}
            />

            <button
              onClick={handleCompare}
              disabled={!userA.trim() || !userB.trim() || loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? "Comparing..." : "Compare"}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        {dataA && dataB && statsA && statsB && (
          <div className="space-y-8">
            {/* User Cards */}
            <div className="grid md:grid-cols-2 gap-8">
              <UserCard
                userData={dataA}
                stats={statsA}
                score={scoreA}
                isWinner={scoreA > scoreB}
              />
              <UserCard
                userData={dataB}
                stats={statsB}
                score={scoreB}
                isWinner={scoreB > scoreA}
              />
            </div>

            {/* Detailed Comparison */}
            <div className="bg-white rounded-xl shadow-lg p-3">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Detailed Comparison
              </h2>

              <div className="space-y-4">
                <StatCard
                  icon={Users}
                  label="Followers"
                  valueA={dataA.followers}
                  valueB={dataB.followers}
                />

                <StatCard
                  icon={Star}
                  label="Total Stars"
                  valueA={statsA.stars}
                  valueB={statsB.stars}
                />

                <StatCard
                  icon={GitFork}
                  label="Total Forks"
                  valueA={statsA.forks}
                  valueB={statsB.forks}
                />

                <StatCard
                  icon={Code}
                  label="Public Repositories"
                  valueA={dataA.public_repos}
                  valueB={dataB.public_repos}
                />

                <StatCard
                  icon={Activity}
                  label="Recent Activity (6 months)"
                  valueA={statsA.recentActivity}
                  valueB={statsB.recentActivity}
                />

                <StatCard
                  icon={Award}
                  label="Avg Stars per Repo"
                  valueA={statsA.avgStarsPerRepo}
                  valueB={statsB.avgStarsPerRepo}
                  formatValue={(v) => v.toFixed(1)}
                />

                <StatCard
                  icon={Code}
                  label="Programming Languages"
                  valueA={statsA.totalLangs}
                  valueB={statsB.totalLangs}
                />

                <StatCard
                  icon={Users}
                  label="Follower/Following Ratio"
                  valueA={statsA.followerRatio}
                  valueB={statsB.followerRatio}
                  formatValue={(v) => v.toFixed(1)}
                />

                <StatCard
                  icon={Calendar}
                  label="Years on GitHub"
                  valueA={
                    new Date().getFullYear() -
                    new Date(dataA.created_at).getFullYear()
                  }
                  valueB={
                    new Date().getFullYear() -
                    new Date(dataB.created_at).getFullYear()
                  }
                />

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-gray-700">
                    <span className="font-medium">Top Language:</span>{" "}
                    {statsA.topLang}
                  </div>
                  <Code className="w-5 h-5 text-gray-600" />
                  <div className="text-gray-700">
                    <span className="font-medium">Top Language:</span>{" "}
                    {statsB.topLang}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
