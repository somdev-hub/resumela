import { FaFileAlt } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";

const Cards = ({ newResume, newCoverLetter }) => {
  return (
    <div className="flex flex-col md:flex-row gap-8 justify-center mx-4 md:mx-[16rem]">
      {/* Resumes Card */}
      <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center">
        <FaFileAlt className="text-blue-500 text-4xl mb-4" />
        <h3 className="font-bold text-xl mb-2">Resumes</h3>
        <p className="text-gray-600 text-center mb-6">
          Manage your existing resumes or create a new one from scratch or from
          a template.
        </p>
        <div className="flex gap-2">
          <button
            onClick={newResume}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-semibold"
          >
            + New Resume
          </button>
        </div>
      </div>

      {/* Cover Letters Card */}
      <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center">
        <MdOutlineMail className="text-blue-500 text-4xl mb-4" />
        <h3 className="font-bold text-xl mb-2">Cover Letters</h3>
        <p className="text-gray-600 text-center mb-6">
          Craft the perfect cover letter to accompany your resume and land your
          dream job.
        </p>
        <div className="flex gap-2">
          <button
            onClick={newCoverLetter}
            className="bg-gray-100 text-gray-800 border border-gray-300 px-4 py-2 rounded shadow hover:bg-gray-200 font-semibold"
          >
            + New Cover Letter
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cards;
