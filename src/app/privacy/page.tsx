import React from "react";

const PrivacyPolicyPage = () => {
  return (
    <main className="min-h-screen bg-black px-6 py-50 text-gray-200">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 text-center text-4xl font-bold text-white sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mb-12 text-center text-gray-400">
          Last updated April 18th, 2025
        </p>

        <section className="space-y-12 text-base leading-relaxed text-gray-300">
          <div>
            <h2 className="mb-3 text-2xl font-semibold text-white">
              Introduction
            </h2>
            <p>
              Mailyx (“Mailyx,” “we,” “us,” or “our”) values your privacy and is
              committed to protecting your personal information. This Privacy
              Policy explains how we collect, use, and share data, and the
              choices you have. We may also provide additional notices depending
              on how you interact with us.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-white">
              Information We Collect and Use
            </h2>
            <ul className="list-inside list-disc space-y-1">
              <li>Website activity</li>
              <li>Application usage</li>
              <li>Customer support data</li>
              <li>Marketing interactions</li>
              <li>Cookies and analytics</li>
              <li>Legal compliance</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-white">
              Our Website
            </h2>
            <p>
              We collect information on how you interact with our website to
              provide services, improve user experience, and personalize
              content. This includes IP addresses, device information, and
              behavior on our pages.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-white">
              Marketing
            </h2>
            <p>
              We may use your contact details to share product updates or
              promotional offers. You can opt out at any time by contacting us
              or clicking unsubscribe links in emails.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-white">
              Cookies and Related Technologies
            </h2>
            <p>
              We use cookies and tracking tools to understand usage, improve
              services, and deliver relevant content. Some features may not
              function properly without them. Third-party providers may also
              collect data on our behalf.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-white">Children</h2>
            <p>
              Mailyx does not knowingly collect or process data from children
              under the age of 16. If we become aware of such data being
              collected, we will delete it promptly.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-white">
              Not Covered by This Policy
            </h2>
            <p>
              This Privacy Policy does not cover employees, job applicants, or
              customer data we process as a service provider. Please contact
              your service provider for such inquiries.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-white">
              Sharing Personal Information
            </h2>
            <p>
              We only share data with service providers, legal entities, or
              partners when necessary for operations or compliance. All sharing
              is subject to appropriate confidentiality and data protection
              standards.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-white">
              Information Security and Retention
            </h2>
            <p>
              We apply administrative and technical safeguards to protect your
              data. We retain information only as long as necessary for the
              purpose it was collected or to meet legal obligations.
            </p>
            <ul className="mt-2 list-inside list-disc">
              <li>Audits and compliance</li>
              <li>Statutory requirements</li>
              <li>Legal claims and disputes</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-white">
              Compliance with Global Privacy Laws (GDPR & CCPA)
            </h2>
            <p>
              Mailyx is available internationally. While we are a small team, we
              respect regulations such as the European Union’s GDPR and
              California’s CCPA. Users have rights under these laws:
            </p>
            <ul className="mt-2 list-inside list-disc">
              <li>Request access or correction of personal data</li>
              <li>Request deletion of your data (when applicable)</li>
              <li>Opt out of data usage for advertising or analytics</li>
              <li>No discrimination for exercising privacy rights</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, contact us at{" "}
              <strong>privacy@mailyx.com</strong>.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-white">
              Your Rights
            </h2>
            <p>
              At any time, you may email us at{" "}
              <strong>privacy@mailyx.com</strong> to:
            </p>
            <ul className="mt-2 list-inside list-disc">
              <li>Access or update personal information</li>
              <li>Download your data (data portability)</li>
              <li>Request deletion of your data</li>
              <li>Ask privacy-related questions or file a complaint</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-white">
              Privacy Policy Updates
            </h2>
            <p>
              We may update this policy from time to time. When we do, the
              revised date will appear at the top of this page. Continued use of
              our services means you accept the updated terms.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default PrivacyPolicyPage;
