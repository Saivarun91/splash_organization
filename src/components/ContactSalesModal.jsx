"use client";

import { useState } from "react";
import { X, Loader2, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { paymentAPI } from "@/lib/api";

const INTRO =
  "Curious to discover how Lovable can speed up development process? Meet with one of our product experts to learn more.";

export function ContactSalesModal({ open, onOpenChange }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    work_email: "",
    phone: "",
    company_website: "",
    problems_trying_to_solve: "",
    users_to_onboard: "",
    timeline: "",
  });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const validateStep1 = () => {
    if (!form.first_name.trim()) return "First name is required.";
    if (!form.last_name.trim()) return "Last name is required.";
    if (!form.work_email.trim()) return "Work email is required.";
    if (!form.phone.trim()) return "Phone number is required.";
    if (!form.company_website.trim()) return "Company's website is required.";
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) {
      alert(err);
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await paymentAPI.submitContactSales(form);
      if (res?.success) {
        setSuccess(true);
      } else {
        alert(res?.error || "Something went wrong.");
      }
    } catch (e) {
      alert(e?.message || "Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSuccess(false);
    setForm({
      first_name: "",
      last_name: "",
      work_email: "",
      phone: "",
      company_website: "",
      problems_trying_to_solve: "",
      users_to_onboard: "",
      timeline: "",
    });
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {success ? "Thank you" : step === 1 ? "Contact details" : "Tell us more"}
          </h3>
          {!success && (
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {success ? (
          <div className="py-6 text-center">
            <CheckCircle className="mx-auto h-14 w-14 text-green-500 mb-4" />
            <p className="text-gray-600">Our team will get back to you shortly.</p>
            <Button onClick={handleClose} className="mt-4">
              Close
            </Button>
          </div>
        ) : step === 1 ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{INTRO}</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First name *</label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => update("first_name", e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="First name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last name *</label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => update("last_name", e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Last name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work email *</label>
              <input
                type="email"
                value={form.work_email}
                onChange={(e) => update("work_email", e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Work email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone number *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company&apos;s website *</label>
              <input
                type="url"
                value={form.company_website}
                onChange={(e) => update("company_website", e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="https://"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleNext} className="gap-2">
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What problems are you trying to solve with Lovable?
              </label>
              <textarea
                value={form.problems_trying_to_solve}
                onChange={(e) => update("problems_trying_to_solve", e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Describe your goals..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How many users would you like to onboard into a shared Lovable Enterprise workspace to start?
              </label>
              <input
                type="text"
                value={form.users_to_onboard}
                onChange={(e) => update("users_to_onboard", e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="e.g. 10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Do you have a timeline to get started?
              </label>
              <input
                type="text"
                value={form.timeline}
                onChange={(e) => update("timeline", e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="e.g. Next quarter"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Continue
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
