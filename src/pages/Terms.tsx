import React from 'react';
import PageLayout from '../components/PageLayout';

const Terms: React.FC = () => {
  return (
    <PageLayout
      title="Terms of Service"
      subtitle="Last updated: April 2026. Please read these terms carefully before using our platform."
    >
      <div className="space-y-10">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">1. Agreement to Terms</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            By accessing or using YKN Movie, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our platform.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">2. Use of Service</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            YKN Movie provides a platform for streaming movies and series using third-party embedding services. You agree to use the service only for lawful purposes and in accordance with these terms.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-[var(--text-secondary)]">
            <li>You must be at least 13 years old to use this service.</li>
            <li>You may not use the platform to distribute illegal content.</li>
            <li>We reserve the right to terminate access for users who violate these terms.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">3. Intellectual Property</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            The platform's interface, logo, and brand are the exclusive property of YKN Movie. All movie content and metadata are provided by third-party APIs (TMDB) and streaming servers; YKN Movie does not claim ownership of the movies streamed.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">4. Disclaimer of Liability</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            YKN Movie is provided "as is" without any warranties. We are not responsible for the content of third-party streaming servers or any technical issues arising from their use.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">5. Changes to Terms</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            We reserve the right to modify these terms at any time. We will notify users of any significant changes by updating the "Last updated" date of these terms.
          </p>
        </section>
      </div>
    </PageLayout>
  );
};

export default Terms;
