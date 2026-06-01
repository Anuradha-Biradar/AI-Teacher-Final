import React, { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { saveUser } from "../store/auth";
interface Props {
  onClose: () => void;
}

const AuthPage: React.FC<Props> = ({ onClose }) => {

  const [isSignup, setIsSignup] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
const handleContinue = () => {
  if (!email || !password || (isSignup && !name)) {
    alert("Please fill all fields");
    return;
  }

  const user = {
    name: name || "User",
    email,
  };

  saveUser(user);

  alert(isSignup ? "Signup Successful!" : "Signin Successful!");

  console.log({
    name,
    email,
    password,
  });

  onClose();

  window.location.reload(); // optional
};


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">

      <div className="w-full max-w-md bg-[#111827] rounded-3xl shadow-2xl overflow-hidden relative border border-slate-800">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-all"
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="p-10">

          {/* Title */}
          <h1 className="text-4xl font-bold text-white text-center mb-3">
            {isSignup ? "Create Account" : "Sign in to IntelliTutor"}
          </h1>

          <p className="text-slate-400 text-center mb-8">
            {isSignup
              ? "Create your account to continue learning"
              : "Welcome back! Please sign in to continue"}
          </p>

          {/* Name */}
          {isSignup && (
            <div className="mb-5">
              <label className="block text-white mb-2 font-medium">
                Full Name
              </label>

              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#1F2937] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-sky-500"
              />
            </div>
          )}

          {/* Email */}
          <div className="mb-5">
            <label className="block text-white mb-2 font-medium">
              Email address
            </label>

            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1F2937] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-sky-500"
            />
          </div>

          {/* Password */}
          <div className="mb-8">
            <label className="block text-white mb-2 font-medium">
              Password
            </label>

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1F2937] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-sky-500 pr-12"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 -translate-y-1/2 right-4 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>

            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className="w-full bg-white hover:bg-slate-200 text-black py-3 rounded-xl font-semibold transition-all"
          >
            {isSignup ? "Create Account" : "Continue"}
          </button>

        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 py-6 text-center">

          {isSignup ? (
            <p className="text-slate-400">
              Already have an account?{" "}
              <button
                onClick={() => setIsSignup(false)}
                className="text-white font-semibold hover:text-sky-400 transition-all"
              >
                Sign in
              </button>
            </p>
          ) : (
            <p className="text-slate-400">
              Don't have an account?{" "}
              <button
                onClick={() => setIsSignup(true)}
                className="text-white font-semibold hover:text-sky-400 transition-all"
              >
                Sign up
              </button>
            </p>
          )}

        </div>

      </div>
    </div>
  );
};

export default AuthPage;