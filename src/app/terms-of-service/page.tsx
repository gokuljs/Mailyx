import React from "react";
import Footer from "../_components/footer";
import ParticlesBackground from "../_components/Particles";
import NavBar from "../_components/navbar";

const TermsOfServicePage = () => {
  return (
    <main className="min-h-screen pt-40 text-gray-200">
      <NavBar />
      <ParticlesBackground />
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="mb-4 text-center text-4xl font-bold text-stone-200 sm:text-5xl">
          Terms and Conditions
        </h1>
        <p className="mb-12 text-center text-gray-400">
          Last updated May 1st, 2024
        </p>

        <section className="space-y-12 text-base leading-relaxed text-gray-300">
          <div>
            <h2 className="mb-3 text-2xl font-semibold text-white">
              1. Introduction
            </h2>
            <p>
              By using Mailyx you confirm your acceptance of, and agree to be
              bound by, these terms and conditions.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-white">
              2. Agreement to Terms and Conditions
            </h2>
            <p>
              This Agreement takes effect on the date on which you first use the
              Mailyx application.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-white">
              3. Third-Party API Services and Data Usage
            </h2>
            <p>
              When you connect Mailyx to your Google account, our use of your
              data is subject to Google&apos;s API Services User Data Policy,
              including the Limited Use requirements. We ensure that:
            </p>
            <ul className="mt-2 list-inside list-disc">
              <li>
                We only request access to the data necessary for the features
                you use
              </li>
              <li>We do not sell your Google account data</li>
              <li>
                We do not use your Google user data for advertising purposes
              </li>
              <li>
                We limit our use of your Google user data to providing or
                improving user-facing features
              </li>
              <li>
                We do not use or transfer your Google user data for serving
                advertisements
              </li>
              <li>
                We provide a method for you to revoke our access to your data
              </li>
              <li>We securely store any Google user data we maintain</li>
            </ul>
            <p className="mt-2">
              You can learn more about Google&apos;s Limited Use Requirements
              at:{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                className="text-blue-400 hover:underline"
              >
                https://developers.google.com/terms/api-services-user-data-policy
              </a>
            </p>
            <p className="mt-4">
              When you connect Mailyx to your Microsoft account, our use of your
              data is subject to Microsoft&apos;s API Terms of Use. We ensure
              that:
            </p>
            <ul className="mt-2 list-inside list-disc">
              <li>
                We only access data necessary for the functionality of Mailyx
              </li>
              <li>We do not sell your Microsoft account data</li>
              <li>
                We handle your Microsoft data in accordance with our Privacy
                Policy
              </li>
              <li>
                We provide a method for you to disconnect your Microsoft account
              </li>
              <li>
                We maintain appropriate security measures to protect your data
              </li>
            </ul>
            <p className="mt-2">
              You can learn more about Microsoft&apos;s API Terms at:{" "}
              <a
                href="https://learn.microsoft.com/en-us/legal/microsoft-apis/terms-of-use"
                className="text-blue-400 hover:underline"
              >
                https://learn.microsoft.com/en-us/legal/microsoft-apis/terms-of-use
              </a>
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-white">
              4. Unlimited Access Software License with Termination Rights
            </h2>
            <p>
              The Mailyx Software License facilitates the acquisition of Mailyx
              software through a single purchase, granting users unrestricted
              and perpetual access to its comprehensive functionalities.
              Tailored for independent creators, entrepreneurs, and small
              businesses, Mailyx empowers users to create compelling web pages
              and online portfolios.
              <br />
              <br />
              This license entails a straightforward and flexible arrangement,
              exempting users from recurring fees or subscriptions. However, it
              is important to acknowledge that the licensor retains the right to
              terminate the license without conditions or prerequisites.
              <br />
              <br />
              Opting for the Mailyx Software License enables users to enjoy the
              benefits of the software while recognizing the licensor&apos;s
              unrestricted termination rights, which provide adaptability and
              address potential unforeseen circumstances.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-white">
              5. Refunds
            </h2>
            <p>
              Due to the nature of digital products, the Mailyx boilerplate
              cannot be refunded or exchanged once access is granted.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-white">
              6. Disclaimer
            </h2>
            <p>
              It is not warranted that Mailyx will meet your requirements or
              that its operation will be uninterrupted or error free. All
              express and implied warranties or conditions not stated in this
              Agreement are excluded and expressly disclaimed. This Agreement
              does not affect your statutory rights.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-white">
              7. Warranties and Limitation of Liability
            </h2>
            <p>
              Mailyx does not give any warranty, guarantee or other term as to
              the quality, fitness for purpose or otherwise of the software.
              Mailyx shall not be liable for any indirect, special or
              consequential loss, damage, or other claims. In the event that
              Mailyx is deemed liable, you agree that liability is limited to
              the amount you paid for the software.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-white">
              8. Responsibilities
            </h2>
            <p>
              Mailyx is not responsible for what the user does with the
              user-generated content.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-white">
              9. Third-Party Services
            </h2>
            <p>
              Mailyx integrates with third-party services such as Google and
              Microsoft. Your use of these integrations is subject to their
              respective terms and conditions:
            </p>
            <ul className="mt-2 list-inside list-disc">
              <li>
                Google APIs:{" "}
                <a
                  href="https://developers.google.com/terms"
                  className="text-blue-400 hover:underline"
                >
                  https://developers.google.com/terms
                </a>
              </li>
              <li>
                Microsoft APIs:{" "}
                <a
                  href="https://learn.microsoft.com/en-us/legal/microsoft-apis/terms-of-use"
                  className="text-blue-400 hover:underline"
                >
                  https://learn.microsoft.com/en-us/legal/microsoft-apis/terms-of-use
                </a>
              </li>
            </ul>
            <p className="mt-2">
              We are not responsible for any changes to these third-party terms
              or services that may affect your use of Mailyx.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-white">
              10. Price Adjustments
            </h2>
            <p>
              As we continue to improve Mailyx and expand our offerings, the
              price may increase. The discount is provided to help customers
              secure the current price without being surprised by future
              increases.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-white">
              11. General Terms and Law
            </h2>
            <p>
              This Agreement is governed by the laws of Singapore. You
              acknowledge that no joint venture, partnership, employment, or
              agency relationship exists between you and Mailyx as a result of
              your use of these services. You agree not to hold yourself out as
              a representative, agent, or employee of Mailyx.
            </p>
          </div>
        </section>
      </div>
      <div className="z-50 w-full">
        <Footer />
      </div>
    </main>
  );
};

export default TermsOfServicePage;
