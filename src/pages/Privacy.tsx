import React from 'react';
import PageLayout from '../components/PageLayout';

const Privacy: React.FC = () => {
  return (
    <PageLayout 
      title="Privacy Policy" 
      subtitle="Your privacy is critically important to us. Here's how we protect it."
    >
      <div className="space-y-10">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">1. Data Collection</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            KNY Movie is designed to be as private as possible. We do not require users to create accounts or provide personal identification. However, we may collect minimal data such as:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-[var(--text-secondary)]">
            <li>Language preferences to optimize your UI experience.</li>
            <li>Browser and device type for technical optimization.</li>
            <li>Usage metrics to identify popular content.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">2. Third-Party Services</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Our platform utilizes third-party APIs (The Movie Database) and streaming servers. These services may collect their own data (such as IP addresses) when you load metadata or stream movies. We recommend reviewing their respective privacy policies.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">3. Cookies</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            We use locally stored cookies to remember your theme (dark/light mode) and language settings. These cookies do not track your activity across other websites.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">4. Security</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            We implement high-level security measures to protect our platform. While no system is 100% secure, we constantly update our codebase to follow the latest security best practices.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">5. Contact</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            If you have any questions regarding this Privacy Policy, please contact us via our Contact page or support email.
          </p>
        </section>
      </div>
    </PageLayout>
  );
};

export default Privacy;
