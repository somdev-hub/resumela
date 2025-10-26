import React, { useEffect, useState } from "react";
import { FaFileAlt } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";

import Navbar from "../components/Navbar";
import Cards from "../components/Cards";
import { useNavigate } from "react-router-dom";
import { initFirestore } from "../firebase/firestore";
import { collection, getDocs } from "firebase/firestore";

// Create a small SVG data URL used as a preview thumbnail for the document cards
const svgDataUrl = (title) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='440' height='240'><rect width='100%' height='100%' fill='%23ffffff' stroke='%23e5e7eb' rx='12' ry='12'/><text x='16' y='40' font-family='Arial, Helvetica, sans-serif' font-size='20' fill='%230f172a'>${title.replace(
    /</g,
    ""
  )}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const Home = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchResumes() {
      setLoading(true);
      try {
        const db = initFirestore();
        const snaps = await getDocs(collection(db, "resume_content"));
        const items = snaps.docs.map((d) => {
          const data = d.data() || {};
          // Prefer a user-visible name in formData.fullName, fall back to title or untitled
          const title =
            (data.formData && data.formData.fullName) ||
            data.title ||
            "Untitled Resume";
          // Firestore timestamps may be present on updatedAt/createdAt
          const updatedAt = data.updatedAt
            ? data.updatedAt.toDate
              ? data.updatedAt.toDate().toISOString()
              : data.updatedAt
            : data.createdAt
            ? data.createdAt.toDate
              ? data.createdAt.toDate().toISOString()
              : data.createdAt
            : new Date().toISOString();
          return {
            id: d.id,
            title,
            updatedAt,
            type: "resume",
            created: true,
          };
        });
        if (mounted) setResumes(items);
      } catch (err) {
        // Keep simple for now — surface error in console
        console.error("Failed to load resumes:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchResumes();
    return () => {
      mounted = false;
    };
  }, []);
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

  const [userName, setUserName] = useState("");

  useEffect(() => {
    let mounted = true;
    let unsubscribe = null;
    (async () => {
      try {
        // dynamic import so we don't need a top-level import change
        const { getAuth, onAuthStateChanged } = await import("firebase/auth");
        const auth = getAuth();
        // use onAuthStateChanged so we react to when Firebase finishes initializing the user
        unsubscribe = onAuthStateChanged(auth, (user) => {
          const name =
            user?.displayName ||
            (user?.email ? user.email.split("@")[0] : "") ||
            "Guest";
          if (mounted) setUserName(name);
        });
      } catch (err) {
        console.error("Failed to get auth user:", err);
      }
    })();
    return () => {
      mounted = false;
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  return (
    <div className=" bg-gray-50 flex flex-col items-center justify-center">
      <Navbar />

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">
          Welcome back, {userName || "Guest"}!
        </h2>
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
          {(loading ? [] : resumes).map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl shadow-md p-4 flex flex-col items-start"
            >
              {/* Image Preview (simple SVG generated thumbnail) */}
              <img
                src={svgDataUrl(doc.title)}
                alt={`${doc.title} preview`}
                className="mb-2 w-full rounded border border-gray-200 bg-gray-50"
                style={{ display: "block" }}
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
                  : `Created ${getTimeAgo(doc.updatedAt)}`}{" "}
                <span
                  className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${
                    doc.created
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {doc.created ? "Created" : "Imported"}
                </span>
              </p>
              {/* Removed preview text here */}
              <button
                onClick={() => navigate(`/resume/${doc.id}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-semibold"
              >
                Edit
              </button>
            </div>
          ))}
          {/* Create New Card */}
          <button
            type="button"
            onClick={() => navigate("/resume")}
            className="cursor-pointer bg-gray-100 rounded-xl shadow-md p-4 flex flex-col items-center justify-center hover:bg-gray-200"
          >
            <div className="text-blue-500 text-3xl mb-2">+</div>
            <h3 className="font-bold text-lg">Create New</h3>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
