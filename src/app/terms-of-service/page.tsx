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
          Last updated April 18th, 2025
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
              3. Unlimited Access Software License with Termination Rights
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
              4. Refunds
            </h2>
            <p>
              Due to the nature of digital products, the Mailyx boilerplate
              cannot be refunded or exchanged once access is granted.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-white">
              5. Disclaimer
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
              6. Warranties and Limitation of Liability
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
              7. Responsibilities
            </h2>
            <p>
              Mailyx is not responsible for what the user does with the
              user-generated content.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-2xl font-semibold text-white">
              8. Price Adjustments
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
              9. General Terms and Law
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
