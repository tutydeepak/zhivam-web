export default function PrivacyPage() {
    return (
        <section className="min-h-screen px-6 md:px-12 py-32 text-white">
            <div className="max-w-3xl mx-auto space-y-10">
                <h1 className="text-4xl font-bold text-center">
                    Privacy Policy
                </h1>

                <p className="text-slate-400 text-center">
                    Last updated: Feb 2026
                </p>

                <div className="space-y-8 text-slate-300 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            Information We Collect
                        </h2>
                        <p>
                            We collect information you provide during account
                            creation, service requests, and communication with
                            our platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            How We Use Information
                        </h2>
                        <p>
                            Information is used to deliver services, improve
                            user experience, and communicate updates.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            Data Security
                        </h2>
                        <p>
                            We implement reasonable security measures to protect
                            your data from unauthorized access.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            Third-Party Services
                        </h2>
                        <p>
                            We may use trusted third-party services for hosting,
                            analytics, and communications.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            Contact
                        </h2>
                        <p>
                            For privacy concerns, contact us at
                            support@zhivamweb.com.
                        </p>
                    </section>
                </div>
            </div>
        </section>
    );
}