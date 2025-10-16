import React from "react";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-4 py-4 bg-white/30 backdrop-blur-md shadow-lg rounded-xl w-full mb-8">
      <h1 className="text-2xl font-bold">Resumela</h1>
      <ul className="flex flex-1 justify-center gap-8 list-none m-0 p-0">
        <li className="text-lg">Home</li>
        <li className="text-lg">About</li>
        <li className="text-lg">Contact</li>
      </ul>
      <div>
        <button className="mr-2 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-semibold">
          Sign Up
        </button>
        <button className="bg-gray-100 text-gray-800 border border-gray-300 px-4 py-2 rounded shadow hover:bg-gray-200 font-semibold">
          Log In
        </button>
      </div>
    </nav>
  );
};

export default Navbar;