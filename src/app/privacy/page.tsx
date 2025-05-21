import React from "react";
import Footer from "../_components/footer";
import NavBar from "../_components/navbar";
import ParticlesBackground from "../_components/Particles";

const PrivacyPolicyPage = () => {
  return (
    <main className="min-h-screen pt-40 text-gray-200">
      <NavBar />
      <ParticlesBackground />
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="mb-4 text-center text-4xl font-bold text-stone-200 sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mb-12 text-center text-gray-400">
          Last updated May 1st, 2024
        </p>

        <section className="space-y-12 text-base leading-relaxed text-gray-300">
          <div>
            <h2 className="mb-3 text-2xl font-semibold text-white">
              Introduction
            </h2>
            <p>
              Mailyx (&quot;Mailyx,&quot; &quot;we,&quot; &quot;us,&quot; or
              &quot;our&quot;) values your privacy and is committed to
              protecting your personal information. This Privacy Policy explains
              how we collect, use, and share data, and the choices you have. We
              may also provide additional notices depending on how you interact
              with us.
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
              <li>
                Email data via Google and Microsoft authorization (with your
                permission)
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-white">
              Google and Microsoft Data Access and Usage
            </h2>
            <p>
              When you connect your Google or Microsoft account to Mailyx, we
              request permission to access your email data. This includes:
            </p>
            <ul className="mt-2 list-inside list-disc">
              <li>Reading emails and attachments</li>
              <li>Sending emails on your behalf</li>
              <li>Managing drafts</li>
              <li>
                Accessing email metadata (sender, recipient, subject, date)
              </li>
            </ul>
            <p className="mt-2">
              We use this access solely to provide Mailyx&apos;s email
              management functionality, including:
            </p>
            <ul className="mt-2 list-inside list-disc">
              <li>Displaying and organizing your emails within the app</li>
              <li>Enabling search functionality across your messages</li>
              <li>Sending emails you compose through our interface</li>
              <li>Saving draft emails</li>
            </ul>
            <p className="mt-2">
              We access this data through the Aurinko API, which serves as an
              intermediary between Mailyx and both Google and Microsoft
              services. All data access follows OAuth 2.0 security standards and
              respects the scope of permissions you grant.
            </p>
            <p className="mt-2">
              <strong>Important:</strong> We do not use data obtained through
              Google Workspace APIs to develop, improve, or train generalized AI
              and/or machine learning models. All data is used solely for
              providing the service functionality described above.
            </p>
            <p className="mt-2">
              While Mailyx uses artificial intelligence and large language
              models (LLMs) to help users compose emails and enhance
              productivity, we do not use your email data to train these AI
              models. We utilize pre-trained AI models and do not feed your
              personal data or email content into any training datasets for AI
              development.
            </p>
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
            <p className="mt-2">Regarding your email data, we:</p>
            <ul className="mt-2 list-inside list-disc">
              <li>Use Aurinko as our email API service provider</li>
              <li>Do not sell your account data to third parties</li>
              <li>
                Only share data with service providers as necessary to provide
                our services
              </li>
              <li>
                Require all service providers to maintain confidentiality and
                security of your data
              </li>
            </ul>
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
            <p className="mt-2">For email account data specifically:</p>
            <ul className="mt-2 list-inside list-disc">
              <li>
                Email data is primarily processed in real-time and not
                permanently stored by Mailyx
              </li>
              <li>
                We cache some email data temporarily to improve performance
              </li>
              <li>
                When you disconnect your accounts or delete your Mailyx account,
                we remove all cached data
              </li>
              <li>
                We retain minimal logs for security and debugging purposes for
                up to 30 days
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-white">
              Compliance with Global Privacy Laws (GDPR & CCPA)
            </h2>
            <p>
              Mailyx is available internationally. While we are a small team, we
              respect regulations such as the European Union&apos;s GDPR and
              California&apos;s CCPA. Users have rights under these laws:
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
              Revoking Access to Your Accounts
            </h2>
            <p>
              You can revoke Mailyx&apos;s access to your email accounts at any
              time through:
            </p>
            <ul className="mt-2 list-inside list-disc">
              <li>Disconnecting your account within the Mailyx application</li>
              <li>
                For Google: Visiting Google&apos;s Security page at{" "}
                <a
                  href="https://myaccount.google.com/permissions"
                  className="text-blue-400 hover:underline"
                >
                  https://myaccount.google.com/permissions
                </a>
              </li>
              <li>
                For Microsoft: Visiting Microsoft&apos;s Account permissions
                page at{" "}
                <a
                  href="https://account.live.com/consent/Manage"
                  className="text-blue-400 hover:underline"
                >
                  https://account.live.com/consent/Manage
                </a>
              </li>
              <li>
                Contacting us at <strong>privacy@mailyx.com</strong> to request
                removal
              </li>
            </ul>
            <p className="mt-2">
              When you revoke access, we immediately stop accessing your data
              and remove cached content within 30 days.
            </p>
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
      <div className="z-50 w-full bg-transparent">
        <Footer />
      </div>
    </main>
  );
};

export default PrivacyPolicyPage;
