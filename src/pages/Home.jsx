import React from "react";
import { FaFileAlt } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";

import Navbar from "../components/Navbar";
import Cards from "../components/Cards";

const Home = () => {
  const dummyResumes = [
    {
      id: 1,
      title: "Software Engineer Resume",
      updatedAt: "2024-06-20",
      type: "resume",
      created: false
    },
    {
      id: 2,
      title: "Product Manager Resume",
      updatedAt: "2024-06-15",
      type: "resume",
      created: false
    },
    {
      id: 3,
      title: "Cover Letter - Acme Inc.",
      updatedAt: "2024-06-18",
      type: "cover letter",
      created: false
    },
  ]
  // Helper to get time ago string
  const getTimeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
  };

  return (
    <div className=" bg-gray-50 flex flex-col items-center justify-center">
      <Navbar />

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Welcome back, Sarah!</h2>
        <p className="text-lg text-gray-600">
          What would you like to do today?
        </p>
      </div>

      <Cards />

      {/* Your Documents Section */}
      <div className="mt-12 w-full max-w-5xl">
        <h2 className="text-2xl font-bold mb-4">Your Documents</h2>
        <div className="grid grid-cols-4 gap-4">
          {/* Document Cards */}
          {dummyResumes.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl shadow-md p-4 flex flex-col items-start">
              {/* Canvas Preview */}
              <canvas
                width={220}
                height={120}
                className="mb-2 w-full rounded border border-gray-200 bg-gray-50"
                style={{ display: "block" }}
                aria-label="Document preview"
              />
              {doc.type === "resume" ? (
                <FaFileAlt className="text-blue-500 text-3xl mb-2" />
              ) : (
                <MdOutlineMail className="text-blue-500 text-3xl mb-2" />
              )}
              <h3 className="font-bold text-lg">{doc.title}</h3>
              <p className="text-gray-500 text-sm mb-2">
                {doc.type === "resume"
                  ? `Updated ${getTimeAgo(doc.updatedAt)}`
                  : `Created ${getTimeAgo(doc.updatedAt)}`}
                {" "}
                <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${doc.created ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {doc.created ? "Created" : "Imported"}
                </span>
              </p>
              {/* Removed preview text here */}
              <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-semibold">
                Edit
              </button>
            </div>
          ))}
          {/* Create New Card */}
          <div className="bg-gray-100 rounded-xl shadow-md p-4 flex flex-col items-center justify-center">
            <div className="text-blue-500 text-3xl mb-2">+</div>
            <h3 className="font-bold text-lg">Create New</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
