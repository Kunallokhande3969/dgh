"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { asyncapplyjobstudent } from "@/store/Actions/studentAction";
import axios from "@/utiles/axios";

const Page = ({ params }) => {
  const { jobs, student } = useSelector((state) => state.studentReducer);
  const [singleJob, setSingleJob] = useState(null);
  const router = useRouter();
  const dispatch = useDispatch();

  // Resume upload state & ref
  const fileInputRef = useRef();
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const job = jobs && jobs.find((job) => job._id === params.id);
    setSingleJob(job);
  }, [jobs, params.id]);

  const ApplyJobHandler = (id) => {
    dispatch(asyncapplyjobstudent(id));
  };

  // Resume upload handler
  const handleResumeUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      alert("Please select a file!");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", singleJob?.description || "");
    formData.append("jobId", singleJob?._id || "");

    setLoading(true);
    setAiResult(null);

    try {
      const res = await axios.post(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/resume/analyze`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000,
        }
      );

      const result = res.data.analysis || "Analysis complete!";
      setAiResult(result);

      sessionStorage.setItem(
        "resumeAnalysisResult",
        JSON.stringify({
          result,
          jobTitle: singleJob?.title || "Job Title",
          company: "Company Name",
          skills: singleJob?.skills || "",
          responsibility: singleJob?.description || "",
          timestamp: new Date().toISOString(),
        })
      );
   
      router.push("/student/auth/Ai-result");
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Upload failed. Please try again.";
      setAiResult(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!singleJob)
    return <div className="container mx-auto py-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <svg
                className="w-3 h-3 mr-2.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
              </svg>
              Back to Jobs
            </button>
          </li>
        </ol>
      </nav>

      {/* Job Header */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {singleJob.title}
              </h1>
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span>{singleJob.jobtype}</span>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Salary: ₹{singleJob.salary}
                </span>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {singleJob.status}
                </span>
                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Openings: {singleJob.openings}
                </span>
                {singleJob.preference && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {singleJob.preference}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-shrink-0">
              {!singleJob?.students.includes(student && student._id) ? (
                <button
                  onClick={() => ApplyJobHandler(singleJob?._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-md"
                >
                  Apply Now
                </button>
              ) : (
                <button className="bg-green-100 text-green-800 font-medium py-2 px-6 rounded-lg flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Applied
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* About the Job */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                About the Job
              </h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                <p>{singleJob.description}</p>
              </div>
            </div>
          </div>

          {/* Skills Required */}
          {singleJob.skills && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Skills Required
                </h2>
                <div className="flex flex-wrap gap-2">
                  {singleJob.skills.split(",").map((skill, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Perks */}
          {singleJob.perks && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Perks</h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  {singleJob.perks.split("\n").map((perk, index) => (
                    <li key={index}>{perk.trim()}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {singleJob.assesments && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Assessments
                </h2>
                <div className="prose max-w-none text-gray-700">
                  <p>{singleJob.assesments}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Assessments */}

          {/* About Company */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                About the Company
              </h2>
              <div className="prose max-w-none text-gray-700">
                <p>
                  We specialize in the design and delivery of training content
                  in the BFSI domain. Our offerings range from ready products to
                  customized training solutions. Organizations deploy our ready
                  e-learning courses for internal compliance and domain
                  training.
                </p>
              </div>
            </div>
          </div>

          {/* Resume AI Analysis */}
          <div className="bg-white rounded-xl mt-3 shadow-md overflow-hidden">
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Analyze your resume With AI
              </h2>
              <div className="prose max-w-none text-gray-700">
                <p>Analyze your resume according to this job</p>
                <input type="file" ref={fileInputRef} className="mb-2" />
                <button
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  onClick={handleResumeUpload}
                  disabled={loading}
                >
                  {loading ? "Uploading..." : "Upload Resume"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Button for Mobile */}
      <div className="lg:hidden fixed bottom-4 left-0 right-0 px-4">
        <div className="bg-white rounded-lg shadow-lg p-4">
          {!singleJob?.students.includes(student && student._id) ? (
            <button
              onClick={() => ApplyJobHandler(singleJob?._id)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Apply Now
            </button>
          ) : (
            <button className="w-full bg-green-100 text-green-800 font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Applied
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
