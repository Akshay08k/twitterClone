// LandingPage.jsx
import { useState } from "react";
import {
  XLogo,
  XLogoSmall,
  GoogleIcon,
  GithubIcon,
  CloseIcon,
} from "../components/Icons/Icons.jsx";
export default function LandingPage() {
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      {/* Main Content */}
      <div className="flex min-h-screen">
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-[#1d9bf0]">
          <XLogo className="w-96 h-96 text-white" />
        </div>

        {/* Right Content Section */}
        <div className="flex-1 p-8 lg:p-16">
          <div className="max-w-xl">
            {/* Logo */}
            <XLogoSmall className="w-12 h-12 text-white mb-12" />

            {/* Main Text */}
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-12">
              Happening now
            </h1>
            <h2 className="text-3xl font-bold text-white mb-8">Join today.</h2>

            {/* Sign Up Buttons */}
            <div className="space-y-4 max-w-sm">
              <button className="w-full bg-white text-black font-bold py-2 px-4 rounded-full flex items-center justify-center gap-2 hover:bg-gray-200 transition">
                <GoogleIcon className="w-5 h-5" />
                Sign up with Google
              </button>
              <button className="w-full bg-white text-black font-bold py-2 px-4 rounded-full flex items-center justify-center gap-2 hover:bg-gray-200 transition">
                <GithubIcon className="w-5 h-5" />
                Sign up with Github
              </button>

              <div className="flex items-center gap-2">
                <div className="h-px bg-gray-700 flex-1"></div>
                <span className="text-gray-500">or</span>
                <div className="h-px bg-gray-700 flex-1"></div>
              </div>

              <button
                onClick={() => setShowSignUp(true)}
                className="w-full bg-[#1d9bf0] text-white font-bold py-2 px-4 rounded-full hover:bg-[#1a8cd8] transition"
              >
                Create account
              </button>

              <p className="text-xs text-gray-500">
                By signing up, you agree to the{" "}
                <a href="#" className="text-[#1d9bf0] hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#1d9bf0] hover:underline">
                  Privacy Policy
                </a>
                , including{" "}
                <a href="#" className="text-[#1d9bf0] hover:underline">
                  Cookie Use
                </a>
                .
              </p>

              <div className="mt-12">
                <h3 className="font-bold text-white mb-4">
                  Already have an account?
                </h3>
                <button
                  onClick={() => {
                    location.href = "/login";
                  }}
                  className="w-full border border-gray-700 text-[#1d9bf0] font-bold py-2 px-4 rounded-full hover:bg-[#1d9bf0]/10 transition"
                >
                  Sign in
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSignUp && <SignUpModal onClose={() => setShowSignUp(false)} />}
    </div>
  );
}

function SignUpModal({ onClose }) {
  const steps = ["account", "verification", "password"];
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-black w-full max-w-lg rounded-2xl border border-gray-800 p-8">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full"
          >
            <CloseIcon />
          </button>
          <XLogoSmall className="w-8 h-8 text-white" />
          <div className="w-8" /> {/* Spacer for alignment */}
        </div>

        <h2 className="text-2xl font-bold text-white mb-8">
          Create your account
        </h2>

        <form className="space-y-6">
          <input
            type="text"
            placeholder="Name"
            className="w-full bg-transparent border border-gray-700 rounded-md px-4 py-3 text-white focus:outline-none focus:border-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-transparent border border-gray-700 rounded-md px-4 py-3 text-white focus:outline-none focus:border-blue-500"
          />
          <input
            type="date"
            placeholder="Date of birth"
            className="w-full bg-transparent border border-gray-700 rounded-md px-4 py-3 text-white focus:outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            className="w-full bg-white text-black font-bold py-3 rounded-full hover:bg-gray-200 transition"
          >
            Next
          </button>
        </form>
      </div>
    </div>
  );
}
