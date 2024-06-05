import { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  // State variables
  const [myData, setMyData] = useState([]);
  const [isError, setIsError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true); // New state variable
  const [sortOption, setSortOption] = useState("asc"); // New state variable for sorting

  // Fetch data from API using Async Await
  const getMyPostData = async () => {
    try {
      const res = await axios.get("https://randomuser.me/api/?results=500");
      setMyData(res.data.results);
    } catch (error) {
      setIsError(error.message);
    } finally {
      setIsLoading(false); // Set loading to false after data is fetched or error occurs
    }
  };

  // Call the function to fetch data on component mount
  useEffect(() => {
    getMyPostData();
  }, []);

  // Handle search input change
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle sort option change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  // Filter and sort data based on search query and sort option
  const filteredData = myData
    .filter((user) => {
      const fullName =
        `${user.name.title} ${user.name.first} ${user.name.last}`.toLowerCase();
      const country = user.location.country.toLowerCase();
      const gender = user.gender.toLowerCase();
      const search = searchQuery.toLowerCase();

      return (
        fullName.includes(search) ||
        country.includes(search) ||
        gender.includes(search)
      );
    })
    .sort((a, b) => {
      if (sortOption === "asc") {
        return a.name.first.localeCompare(b.name.first);
      } else if (sortOption === "desc") {
        return b.name.first.localeCompare(a.name.first);
      } else if (sortOption === "date") {
        return new Date(a.registered.date) - new Date(b.registered.date);
      }
      return 0;
    });

  // JSX to render
  return (
    <section className="w-full min-h-screen text-white p-10 bg-zinc-900">
      <h1 className="text-6xl text-center font-bold mb-10">Profile Finder</h1>

      <div className="flex mb-10">
        <input
          type="text"
          placeholder="Search by name, country, gender"
          value={searchQuery}
          onChange={handleSearch}
          className="w-full p-2 outline-none rounded-lg border-2 border-zinc-700 bg-zinc-800 text-white"
        />
        <select
          value={sortOption}
          onChange={handleSortChange}
          className="ml-4 p-2 outline-none rounded-lg border-2 border-zinc-700 bg-zinc-800 text-white"
        >
          <option value="asc">Sort by (A-Z)</option>
          <option value="desc">Sort by (Z-A)</option>
          <option value="date">Sort by Date</option>
        </select>
      </div>

      {isError && (
        <h2 className="text-center mt-10 text-2xl text-red-600">{isError}</h2>
      )}
      
      {isLoading ? (
        <h2 className="text-center mt-10 text-2xl text-white">Loading...</h2>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {filteredData.map((user, index) => (
            <div
              key={index}
              className="card bg-zinc-800 p-5 rounded-lg shadow-lg"
            >
              <img
                src={user.picture.large}
                alt={user.name.first}
                className="rounded-full mx-auto mb-4"
              />
              <h2 className="text-xl text-center font-semibold">
                {user.name.title} {user.name.first} {user.name.last}
              </h2>

              <p className=" text-center text-blue-400">@{user.login.username}</p>
              <p className="mt-5 text-zinc-400">Gender: {user.gender}</p>
              <p className="text-zinc-400">
                Email: {user.email.split(".")[1]}.com
              </p>
              <p className=" text-zinc-400">Phone: {user.phone}</p>
              <p className=" text-zinc-400">Country: {user.location.country}</p>
              <p className="text-zinc-400">
                Registered: {new Date(user.registered.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default App;
