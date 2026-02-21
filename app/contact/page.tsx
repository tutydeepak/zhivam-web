export default function ContactPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 to-black text-white flex items-center justify-center px-6">

            <div className="w-full max-w-2xl">

                {/* Heading */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold">Contact Us</h1>
                    <p className="text-slate-400 mt-3">
                        Have a project or question? We'd love to hear from you.
                    </p>
                </div>

                {/* Form */}
                <form className="bg-slate-800/40 backdrop-blur-md border border-slate-700 rounded-xl p-8 space-y-6">

                    {/* Name */}
                    <div>
                        <label className="block text-sm text-slate-300 mb-2">Name</label>
                        <input
                            type="text"
                            placeholder="Your name"
                            className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 transition"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm text-slate-300 mb-2">Email</label>
                        <input
                            type="email"
                            placeholder="you@email.com"
                            className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 transition"
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm text-slate-300 mb-2">Message</label>
                        <textarea
                            rows={5}
                            placeholder="Tell us about your project..."
                            className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 transition resize-none"
                        />
                    </div>

                    {/* Button */}
                    <button
                        type="button"
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 rounded-lg transition"
                    >
                        Send Message
                    </button>

                </form>
            </div>
        </main>
    );
}