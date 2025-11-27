import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

/* ---------- Gradient map used for team cards ---------- */
const TEAM_STYLES = [
  { from: 'from-pink-500', via: 'via-rose-400', to: 'to-orange-300' },
  { from: 'from-sky-500', via: 'via-cyan-400', to: 'to-emerald-300' },
  { from: 'from-violet-500', via: 'via-purple-400', to: 'to-fuchsia-400' },
  { from: 'from-amber-500', via: 'via-orange-400', to: 'to-red-400' },
];

/* ---------- Small helper for listing tiles ---------- */
function Illustration({ emoji, title, text }) {
  return (
    <div className="card bg-base-100 shadow p-5 h-full hover:shadow-lg transition">
      <div className="text-4xl mb-2">{emoji}</div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="opacity-80 text-sm mt-1">{text}</p>
    </div>
  );
}

export default function About() {
  // query form state
  const [topic, setTopic] = useState('General');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [emailFrom, setEmailFrom] = useState('');

  const [errors, setErrors] = useState({});

  // basic email check
  const isValidEmail = (s) => /\S+@\S+\.\S+/.test(s);

  const validate = () => {
    const e = {};
    if (!subject.trim()) e.subject = 'Subject is required';
    if (!message.trim()) e.message = 'Message is required';
    if (!name.trim()) e.name = 'Your name is required';
    if (!emailFrom.trim()) e.emailFrom = 'Your email is required';
    else if (!isValidEmail(emailFrom.trim())) e.emailFrom = 'Please enter a valid email';
    return e;
  };

  const mailtoHref = useMemo(() => {
    const to = 'ayush90xy@gmail.com';
    const s = encodeURIComponent(`[${topic}] ${subject || 'Query from Local&Famous user'}`);
    const body = encodeURIComponent(
      `${message || '(Write your question here)'}\n\n---\nFrom: ${name || '(your name)'}\nContact: ${emailFrom || '(your email)'}`
    );
    return `mailto:${to}?subject=${s}&body=${body}`;
  }, [topic, subject, message, name, emailFrom]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const eObj = validate();
    setErrors(eObj);
    if (Object.keys(eObj).length > 0) {
      // focus first error optionally
      return;
    }
    // open mail client
    window.location.href = mailtoHref;
  };

  const TEAM = [
    { name: 'Abhimanyu Kumar Singh', role: 'FullStack', mail: 'abhimanyukumar6531@gmail.com', initials: 'AK' },
    { name: 'Himanshu Shekhar Murmu', role: 'Frontend', mail: 'murmushekhar07@gmail.com', initials: 'HM' },
    { name: 'Ayush Singh', role: 'FullStack', mail: 'ayush90xy@gmail.com', initials: 'AS' },
    { name: 'Ashutosh Sharma', role: 'Frontend', mail: 'ashutosh.244ca010@nitk.edu.in', initials: 'AS' },
  ];

  return (
    <div className="space-y-10 px-4 md:px-6 lg:px-8">
      {/* HERO */}
      <section className="relative rounded-xl overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/8 via-secondary/8 to-accent/8" />
        <div className="hero min-h-[260px]">
          <div className="hero-content flex-col lg:flex-row gap-10 w-full">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-extrabold tracking-tight">
                Be <span className="text-primary">Vocal</span> for <span className="text-secondary">Local</span>
              </h1>
              <p className="py-4 opacity-80">
                Local&Famous helps you discover nearby gems and empowers neighborhood businesses.
                We connect customers with trusted local vendors — fast, friendly, and fair.
              </p>
              <div className="flex gap-3">
                <Link to="/nearby" className="btn btn-primary">Explore Listings</Link>
                <Link to="/vendor" className="btn">Become a Vendor</Link>
              </div>
            </div>

            <div className="w-full max-w-lg">
              <div className="grid grid-cols-3 gap-3">
                {['🛍️','🍲','🧵','🏛️','🎨','📦'].map((em, i) => (
                  <div key={i} className="h-24 rounded-xl bg-base-100 flex items-center justify-center text-3xl shadow hover:shadow-lg transition">
                    {em}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LISTING TYPES */}
      <section className="space-y-3">
        <h2 className="text-2xl font-bold">What can you list on Local&Famous?</h2>
        <p className="opacity-80">
          We currently support four broad categories of listings to highlight the diversity of local talent:
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Illustration emoji="🍲" title="Food & Beverages" text="Home chefs, tiffin services, pop-up kitchens, local cafés." />
          <Illustration emoji="🧵" title="Handmade & Local Goods" text="Handicrafts, apparel, decor, organic products from local makers." />
          <Illustration emoji="🏛️" title="Heritage Sites" text="Discover and preserve the beauty of your region’s cultural and historical heritage." />
          <Illustration emoji="🛍️" title="Shops & Boutiques" text="Small local stores, boutiques, and artisans — everything made with heart, locally." />
        </div>
      </section>

      {/* GUIDES */}
      <section className="grid lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow p-6 space-y-4">
          <h3 className="text-xl font-semibold">How to find great local listings (for users)</h3>
          <ul className="steps steps-vertical lg:steps-horizontal">
            <li className="step step-primary">Open “Nearby”</li>
            <li className="step step-primary">Allow Location</li>
            <li className="step step-primary">Filter by Category</li>
            <li className="step step-primary">Tap a Card to View</li>
          </ul>
          <div className="collapse collapse-arrow bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title font-medium">Tips for quicker discovery</div>
            <div className="collapse-content opacity-80">
              <ul className="list-disc ml-5">
                <li>Use the map to click any pin and open the listing page.</li>
                <li>Favorite the ones you love for quick access later.</li>
                <li>Check listing hours and directions in one tap.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow p-6 space-y-4">
          <h3 className="text-xl font-semibold">How to get verified & start listing (for vendors)</h3>
          <ul className="steps steps-vertical lg:steps-horizontal">
            <li className="step step-secondary">Create Vendor Profile</li>
            <li className="step step-secondary">Submit Docs</li>
            <li className="step step-secondary">Admin Verifies</li>
            <li className="step step-secondary">Create Listings</li>
          </ul>
          <div className="collapse collapse-arrow bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title font-medium">What happens after verification?</div>
            <div className="collapse-content opacity-80">
              <p>
                Once verified, your listings are published instantly. Add a title, description,
                images, choose category, and pick your location on the map. That’s it!
              </p>
              <div className="mt-3 flex gap-2">
                <Link to="/vendor" className="btn btn-secondary btn-sm">Go to Vendor Dashboard</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE TEAM: gradient avatar left, name then role on next line, contact below */}
      <section id="team" className="space-y-5 mt-6">
        <h2 className="text-2xl font-bold text-center">Core Team</h2>
        <p className="opacity-80 text-center">Meet the minds behind Local&Famous 👥</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map((m, i) => {
            const g = TEAM_STYLES[i % TEAM_STYLES.length];
            return (
              <div
                key={i}
                className="group flex items-start gap-4 bg-base-100 p-4 rounded-2xl shadow-md ring-1 ring-base-200 hover:shadow-lg transition"
              >
                {/* avatar */}
                <div className="relative flex-shrink-0">
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${g.from} ${g.via} ${g.to} opacity-60 blur-md`} />
                  <div className="relative rounded-full w-16 h-16 flex items-center justify-center text-base font-semibold text-white ring-2 ring-white/25 shadow-md">
                    {m.initials}
                  </div>
                </div>

                {/* content */}
                <div className="flex flex-col flex-1 min-w-0">
                  {/* name on first line */}
                  <h3 className="font-semibold text-sm sm:text-base truncate">{m.name}</h3>

                  {/* role on next line (badge style) */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`badge badge-sm text-white border-0 bg-gradient-to-r ${g.from} ${g.to}`}>
                      {m.role}
                    </span>
                  </div>

                  {/* contact (button + small email text) */}
                  <div className="mt-3 flex items-center gap-3">
                    <a
                      href={`mailto:${m.mail}`}
                      className={`btn btn-xs border-0 text-white bg-gradient-to-r ${g.from} ${g.to} shadow`}
                    >
                      Contact
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SUBMIT QUERY: form with validation */}
      <section id="contact" className="card bg-base-100 shadow p-6 space-y-4">
        <h2 className="text-2xl font-bold">Submit a Query</h2>
        <p className="opacity-80">Have a question or suggestion? Send us a message — we’d love to hear from you!</p>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* illustration */}
          <div className="rounded-xl bg-base-200 p-6 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
              {['✉️','💡','🤝','📍','🧭','🚀'].map((em,i)=>(
                <div key={i} className="h-20 rounded-xl bg-base-100 flex items-center justify-center text-3xl shadow">
                  {em}
                </div>
              ))}
            </div>
          </div>

          {/* form */}
          <form className="space-y-3" onSubmit={handleSubmit} noValidate>
            <div className="form-control">
              <label className="label"><span className="label-text">Topic</span></label>
              <select className="select select-bordered" value={topic} onChange={(e)=>setTopic(e.target.value)}>
                <option>General</option>
                <option>Bug Report</option>
                <option>Feature Request</option>
                <option>Vendor Verification</option>
                <option>Listing Help</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Subject</span></label>
              <input
                className={`input input-bordered ${errors.subject ? 'input-error' : ''}`}
                value={subject}
                onChange={(e)=>setSubject(e.target.value)}
                placeholder="Short subject"
              />
              {errors.subject && <span className="text-xs text-error mt-1">{errors.subject}</span>}
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Message</span></label>
              <textarea
                className={`textarea textarea-bordered min-h-[100px] ${errors.message ? 'textarea-error' : ''}`}
                value={message}
                onChange={(e)=>setMessage(e.target.value)}
                placeholder="Tell us more about your query..."
              />
              {errors.message && <span className="text-xs text-error mt-1">{errors.message}</span>}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label"><span className="label-text">Your Name</span></label>
                <input
                  className={`input input-bordered ${errors.name ? 'input-error' : ''}`}
                  value={name}
                  onChange={(e)=>setName(e.target.value)}
                  placeholder="Your name"
                />
                {errors.name && <span className="text-xs text-error mt-1">{errors.name}</span>}
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Your Email</span></label>
                <input
                  type="email"
                  className={`input input-bordered ${errors.emailFrom ? 'input-error' : ''}`}
                  value={emailFrom}
                  onChange={(e)=>setEmailFrom(e.target.value)}
                  placeholder="you@example.com"
                />
                {errors.emailFrom && <span className="text-xs text-error mt-1">{errors.emailFrom}</span>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" className="btn btn-primary">Send Email</button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setTopic('General'); setSubject(''); setMessage(''); setName(''); setEmailFrom(''); setErrors({});
                }}
              >
                Reset
              </button>
            </div>

            <p className="text-xs opacity-70">
              This opens your email app with details pre-filled to <span className="font-medium">ayush90xy@gmail.com</span>.
            </p>
          </form>
        </div>
      </section>

      {/* CTA */}
      <section className="card bg-base-200 p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Ready to explore your neighborhood?</h3>
            <p className="opacity-80">Discover, favorite, and support your local heroes today.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/nearby" className="btn btn-primary">Browse Nearby</Link>
            <Link to="/vendor" className="btn btn-secondary">Start Listing</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
