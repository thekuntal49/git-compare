import { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  // State variables
  const [myData, setMyData] = useState([]);
  const [isError, setIsError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data from API using Async Await
  const getMyPostData = async () => {
    try {
      const res = await axios.get("https://randomuser.me/api/?results=500");
      setMyData(res.data.results);
    } catch (error) {
      setIsError(error.message);
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

  // Filter data based on search query
  const filteredData = myData.filter((user) => {
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
  });

  // JSX to render
  return (
    <section className="w-full min-h-screen text-white p-10 bg-zinc-900">
      <h1 className="text-6xl text-center font-bold mb-10">Profile Finder</h1>

      <input
        type="text"
        placeholder="Search by name, country, gender"
        value={searchQuery}
        onChange={handleSearch}
        className="w-full p-2 mb-10 outline-none rounded-lg border-2 border-zinc-700 bg-zinc-800 text-white"
      />

      {isError && (
        <h2 className="text-center mt-10 text-2xl text-red-600">{isError}</h2>
      )}
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
    </section>
  );
};

export default App;
