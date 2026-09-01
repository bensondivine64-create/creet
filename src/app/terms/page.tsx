export default function TermsPage() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="max-w-2xl mx-auto px-5 py-12">
        <h1 className="font-display text-2xl font-bold text-ink mb-2">Terms of Service</h1>
        <p className="text-sm text-ink/40 mb-8">Last updated: August 2026</p>

        <div className="space-y-6 text-sm text-ink/70 leading-relaxed">
          <section>
            <h2 className="font-semibold text-ink mb-1">1. Accounts</h2>
            <p>
              CREET has four account types: Buyer, Freelancer, Vendor, and Admin.
              Each account is tied to exactly one role. You may not use a single
              account to act as more than one role.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-ink mb-1">2. Your responsibilities</h2>
            <p>
              You&apos;re responsible for the accuracy of your listings, services,
              and communications on CREET. Fraudulent listings, misrepresentation,
              or abuse of the messaging system may result in suspension.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-ink mb-1">3. Messaging</h2>
            <p>
              Buyers, freelancers, and vendors communicate through the CREET inbox.
              Attempting to circumvent the platform to avoid fees or accountability
              may violate these terms.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-ink mb-1">4. Moderation</h2>
            <p>
              CREET reserves the right to review, approve, reject, or remove any
              listing, account, or message that violates these terms or applicable
              law.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-ink mb-1">5. Changes</h2>
            <p>
              We may update these terms as CREET evolves. Continued use of the
              platform after changes means you accept the updated terms.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
