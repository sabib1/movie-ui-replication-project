"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatars, setAvatars] = useState<{ id: number; url: string }[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  });

  const router = useRouter();

  // Fetch avatars from the API
  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const response = await fetch("/api/avatars");
        if (response.ok) {
          const data = await response.json();
          setAvatars(data);
        }
      } catch (error) {
        console.error("Failed to fetch avatars:", error);
      }
    };

    if (isSignUp) {
      fetchAvatars();
    }
  }, [isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Client-side password rules
        if (formData.password.length < 8) {
          toast.error("Password must be at least 8 characters");
          setIsLoading(false);
          return;
        }

        // Validate avatar selection
        if (!selectedAvatar) {
          toast.error("Please select an avatar");
          setIsLoading(false);
          return;
        }

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match");
          setIsLoading(false);
          return;
        }

        // Validate name
        if (!formData.name.trim()) {
          toast.error("Please enter your name");
          setIsLoading(false);
          return;
        }

        // Sign up with avatar
        const { data, error } = await authClient.signUp.email({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          image: selectedAvatar,
        });

        if (error?.code) {
          const errorMap: Record<string, string> = {
            USER_ALREADY_EXISTS: "Email already registered. Please sign in instead.",
            INVALID_EMAIL: "Please enter a valid email address",
            WEAK_PASSWORD: "Password is too weak. Please use at least 8 characters.",
            PASSWORD_TOO_SHORT: "Password must be at least 8 characters",
            PASSWORD_MIN_LENGTH: "Password must be at least 8 characters",
            INVALID_PASSWORD: "Password must be at least 8 characters",
          };
          toast.error(errorMap[error.code] || "Registration failed. Please try again.");
          setIsLoading(false);
          return;
        }

        toast.success("Account created successfully! Redirecting...");
        
        // Redirect to home page after successful signup
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } else {
        // Sign in - First check if email exists
        const checkUserResponse = await fetch("/api/auth/check-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        });

        const checkUserData = await checkUserResponse.json();

        if (!checkUserData.exists) {
          toast.error("No account found with this email. Please sign up first.");
          setIsLoading(false);
          return;
        }

        // Email exists, proceed with login
        const { data, error } = await authClient.signIn.email({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe,
        });

        if (error) {
          // Since email exists, any error here is likely wrong password
          toast.error("Incorrect password. Please try again.");
          setIsLoading(false);
          return;
        }

        toast.success("Signed in successfully! Redirecting...");
        
        // Redirect to home page after successful login
        setTimeout(() => {
          router.push("/");
        }, 1000);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 space-y-5 border border-gray-700/50"
        >
          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-white text-3xl font-semibold">
              {isSignUp ? "Sign Up" : "Sign In"}
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              {isSignUp
                ? "Create your account to get started"
                : "Welcome back! Please login to your account"}
            </p>
          </div>

          {/* Avatar Selection (only for sign up) */}
          {isSignUp && (
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-semibold">Choose Avatar</label>
              <div className="relative bg-gray-700/30 border border-gray-600 rounded-xl p-4">
                <div
                  className="overflow-x-auto pb-2"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(59, 130, 246, 0.5) transparent",
                  }}
                >
                  <div className="flex gap-3 pb-1 flex-nowrap">
                    {avatars.map((avatar) => (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => setSelectedAvatar(avatar.url)}
                        disabled={isLoading}
                        className={`relative rounded-lg overflow-hidden border-2 transition-all hover:scale-105 flex-shrink-0 ${
                          selectedAvatar === avatar.url
                            ? "border-blue-500 ring-2 ring-blue-500/50"
                            : "border-gray-600 hover:border-gray-500"
                        }`}
                      >
                        <img
                          src={avatar.url}
                          alt="Avatar option"
                          className="w-20 h-20 object-cover pointer-events-none"
                        />
                        {selectedAvatar === avatar.url && (
                          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="text-blue-500"
                            >
                              <path
                                d="M20 6L9 17L4 12"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {selectedAvatar && (
                <p className="text-xs text-gray-400 mt-1">✓ Avatar selected</p>
              )}
            </div>
          )}

          {/* Name Field (only for sign up) */}
          {isSignUp && (
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-semibold">Name</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-400"
                  >
                    <path
                      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="7"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your Name"
                  required={isSignUp}
                  disabled={isLoading}
                  className="pl-12 h-12 bg-gray-700/30 border-gray-600 text-white placeholder:text-gray-500 rounded-xl focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-semibold">Email</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg
                  height="20"
                  viewBox="0 0 32 32"
                  width="20"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-400"
                >
                  <g>
                    <path
                      fill="currentColor"
                      d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"
                    ></path>
                  </g>
                </svg>
              </div>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your Email"
                required
                disabled={isLoading}
                className="pl-12 h-12 bg-gray-700/30 border-gray-600 text-white placeholder:text-gray-500 rounded-xl focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-semibold">Password</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg
                  height="20"
                  viewBox="-64 0 512 512"
                  width="20"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-400"
                >
                  <path
                    fill="currentColor"
                    d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"
                  ></path>
                  <path
                    fill="currentColor"
                    d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"
                  ></path>
                </svg>
              </div>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your Password"
                required
                disabled={isLoading}
                autoComplete="off"
                minLength={isSignUp ? 8 : undefined}
                className="pl-12 h-12 bg-gray-700/30 border-gray-600 text-white placeholder:text-gray-500 rounded-xl focus:border-blue-500 transition-colors"
              />
            </div>
            {isSignUp && (
              <p
                className={`text-xs ${
                  formData.password && formData.password.length < 8
                    ? "text-red-400"
                    : "text-gray-400"
                }`}
              >
                Minimum 8 characters
              </p>
            )}
          </div>

          {/* Confirm Password Field (only for sign up) */}
          {isSignUp && (
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-semibold">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <svg
                    height="20"
                    viewBox="-64 0 512 512"
                    width="20"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-400"
                  >
                    <path
                      fill="currentColor"
                      d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"
                    ></path>
                    <path
                      fill="currentColor"
                      d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"
                    ></path>
                  </svg>
                </div>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your Password"
                  required={isSignUp}
                  disabled={isLoading}
                  autoComplete="off"
                  minLength={8}
                  className="pl-12 h-12 bg-gray-700/30 border-gray-600 text-white placeholder:text-gray-500 rounded-xl focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Remember Me & Forgot Password (only for sign in) */}
          {!isSignUp && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      rememberMe: checked as boolean,
                    }))
                  }
                  disabled={isLoading}
                  className="border-gray-600"
                />
                <label
                  htmlFor="rememberMe"
                  className="text-white text-sm cursor-pointer"
                >
                  Remember me
                </label>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-base font-medium transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isSignUp ? "Creating account..." : "Signing in..."}
              </div>
            ) : (
              <>{isSignUp ? "Sign Up" : "Sign In"}</>
            )}
          </Button>

          {/* Toggle Sign In/Up */}
          <p className="text-center text-white text-sm">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              disabled={isLoading}
              className="text-blue-400 font-medium hover:text-blue-300 transition-colors ml-1 disabled:opacity-50"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>

          {/* Back to Home Link */}
          <div className="text-center mt-6">
            <Link
              href="/"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}