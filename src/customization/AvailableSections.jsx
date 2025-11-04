import {
  FaGraduationCap,
  FaBriefcase,
  FaPalette,
  FaCertificate,
  FaBook,
  FaTrophy,
  FaUsers,
  FaFileAlt,
  FaUserTie,
  FaPencilAlt,
  FaList,
  FaGlobe,
} from "react-icons/fa";

export const availableSections = [
    {
      id: "education",
      name: "Education",
      icon: FaGraduationCap,
      description:
        "Show off your primary education, college degrees & exchange semesters.",
    },
    {
      id: "experience",
      name: "Professional Experience",
      icon: FaBriefcase,
      description:
        "A place to highlight your professional experience - including internships.",
    },
    {
      id: "skills",
      name: "Skills",
      icon: FaPalette,
      description:
        "List your technical, managerial or soft skills in this section.",
    },
    {
      id: "languages",
      name: "Languages",
      icon: FaGlobe,
      description:
        "You speak more than one language? Make sure to list them here.",
    },
    {
      id: "certificates",
      name: "Certificates",
      icon: FaCertificate,
      description:
        "Drivers licenses and other industry-specific certificates you have belong here.",
    },
    {
      id: "interests",
      name: "Interests",
      icon: FaBook,
      description:
        "Do you have interests that align with your career aspiration?",
    },
    {
      id: "projects",
      name: "Projects",
      icon: FaList,
      description:
        "Worked on a particular challenging project in the past? Mention it here.",
    },
    {
      id: "courses",
      name: "Courses",
      icon: FaBook,
      description:
        "Did you complete MOOCs or an evening course? Show them off in this section.",
    },
    {
      id: "awards",
      name: "Awards",
      icon: FaTrophy,
      description:
        "Awards like student competitions or industry accolades belong here.",
    },
    {
      id: "organisations",
      name: "Organisations",
      icon: FaUsers,
      description:
        "If you volunteer or participate in a good cause, why not state it?",
    },
      {
        id: "positions",
        name: "Position of responsibility",
        icon: FaUserTie,
        description:
          "Held leadership or responsibility positions (club lead, coordinator, class rep).",
      },
      {
        id: "activities",
        name: "Activities",
        icon: FaList,
        description:
          "Extracurricular activities, events or regular engagements you participated in.",
      },
    {
      id: "publications",
      name: "Publications",
      icon: FaFileAlt,
      description:
        "Academic publications or book releases have a dedicated place here.",
    },
    {
      id: "references",
      name: "References",
      icon: FaUserTie,
      description:
        "If you have former colleagues or bosses that vouch for you, list them.",
    },
    {
      id: "declaration",
      name: "Declaration",
      icon: FaPencilAlt,
      description: "You need a declaration with signature?",
    },
    {
      id: "custom",
      name: "Custom",
      icon: FaList,
      description:
        "You didn't find what you are looking for? Or you want to combine two sections to save space?",
    },
  ];
