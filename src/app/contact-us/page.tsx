"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ParticlesBackground from "../_components/Particles";
import { GlowingEffect } from "../_components/glowing-effect";

interface FormData {
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  email?: string;
  message?: string;
}

export default function ContactUs() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const validationErrors: FormErrors = {};
    if (!formData.email) {
      validationErrors.email = "Email is required.";
    } else if (!validateEmail(formData.email)) {
      validationErrors.email = "Enter a valid email.";
    }

    if (!formData.message) {
      validationErrors.message = "Message is required.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    console.log(formData);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <ParticlesBackground />
      <h2 className="mt-14 mb-12 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-6xl font-bold text-transparent">
        Contact Us
      </h2>
      <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-10 shadow-xl backdrop-blur-md">
        <GlowingEffect
          borderWidth={2}
          spread={50}
          glow={true}
          disabled={false}
          proximity={100}
          inactiveZone={0.1}
          variant="white"
        />
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 border border-white/20 bg-white/10 text-white placeholder-gray-400"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-300"
            >
              Subject
            </label>
            <Input
              id="subject"
              name="subject"
              type="text"
              value={formData.subject}
              onChange={handleChange}
              className="mt-1 border border-white/20 bg-white/10 text-white placeholder-gray-400"
              placeholder="subject"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-300"
            >
              Message <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="message"
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              className="mt-1 min-h-44 resize-none overflow-y-auto border border-white/20 bg-white/10 text-white placeholder-gray-400"
              placeholder="Write your message here..."
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-500">{errors.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 font-semibold text-black hover:opacity-90"
          >
            Send Message
          </Button>
        </form>
      </div>
    </div>
  );
}
