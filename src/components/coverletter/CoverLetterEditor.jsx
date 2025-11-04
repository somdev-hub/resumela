import HeaderConfig from "./HeaderConfig";
import FontSelector from "./FontSelector";
import PersonalDetailsConfig from "./PersonalDetailsConfig";
import SpacingControls from "./SpacingControls";
import PersonalInfoForm from "./PersonalInfoForm";
import LetterDetailsForm from "./LetterDetailsForm";
import LetterContentForm from "./LetterContentForm";
import SignatureSection from "./SignatureSection";

const CoverLetterEditor = ({
  activeTab,
  setActiveTab,
  activeFontCategory,
  setActiveFontCategory,
  layoutConfig,
  setLayoutConfig,
  selectedFont,
  setSelectedFont,
  loadGoogleFont,
  fontStatus,
  personalConfig,
  setPersonalConfig,
  spacingConfig,
  setSpacingConfig,
  formData,
  setFormData,
  syncWithResume,
  setSyncWithResume,
  handleInputChange,
}) => {
  return (
    <section className="h-full flex flex-col">
      <div
        className="w-full hide-scrollbar bg-white/90 p-8 shadow-xl ring-1 ring-indigo-100 h-full flex flex-col"
        style={{ height: "100%", overflow: "auto" }}
      >
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("content")}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === "content"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-600 hover:text-slate-800"
            }`}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab("customize")}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === "customize"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-600 hover:text-slate-800"
            }`}
          >
            Customize
          </button>
        </div>

        {/* Customize Tab */}
        {activeTab === "customize" ? (
          <div>
            <HeaderConfig layoutConfig={layoutConfig} setLayoutConfig={setLayoutConfig} />
            <FontSelector
              activeFontCategory={activeFontCategory}
              setActiveFontCategory={setActiveFontCategory}
              selectedFont={selectedFont}
              setSelectedFont={setSelectedFont}
              loadGoogleFont={loadGoogleFont}
              fontStatus={fontStatus}
            />
            <PersonalDetailsConfig
              personalConfig={personalConfig}
              setPersonalConfig={setPersonalConfig}
            />
            <SpacingControls
              spacingConfig={spacingConfig}
              setSpacingConfig={setSpacingConfig}
            />
          </div>
        ) : (
          /* Content Tab */
          <>
            <PersonalInfoForm
              formData={formData}
              syncWithResume={syncWithResume}
              setSyncWithResume={setSyncWithResume}
              handleInputChange={handleInputChange}
            />
            <LetterDetailsForm formData={formData} handleInputChange={handleInputChange} />
            <LetterContentForm formData={formData} setFormData={setFormData} />
            <SignatureSection
              formData={formData}
              setFormData={setFormData}
              handleInputChange={handleInputChange}
            />
          </>
        )}
      </div>
    </section>
  );
};

export default CoverLetterEditor;
