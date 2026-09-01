export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="max-w-2xl mx-auto px-5 py-12">
        <h1 className="font-display text-2xl font-bold text-ink mb-2">Privacy Policy</h1>
        <p className="text-sm text-ink/40 mb-8">Last updated: August 2026</p>

        <div className="space-y-6 text-sm text-ink/70 leading-relaxed">
          <section>
            <h2 className="font-semibold text-ink mb-1">1. What we collect</h2>
            <p>
              When you sign up, we collect your name, username, email, and
              password (stored securely, never in plain text). Freelancers and
              vendors may provide additional profile details like skills,
              services, and storefront information.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-ink mb-1">2. How we use it</h2>
            <p>
              We use your information to operate your account, verify your
              identity via email OTP, deliver messages between buyers and
              sellers, and improve the platform.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-ink mb-1">3. Sharing</h2>
            <p>
              We don&apos;t sell your personal data. Information you make public
              on your profile or listings is visible to other users as part of
              normal platform use.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-ink mb-1">4. Security</h2>
            <p>
              We use industry-standard measures to protect your data, including
              password hashing and rate-limited login protection.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-ink mb-1">5. Your choices</h2>
            <p>
              You can request account deletion at any time from your settings.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
