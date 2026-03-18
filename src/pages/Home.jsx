import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from "../theme/ThemeProvider.jsx";

export default function Home() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased selection:bg-primary selection:text-white">
      <header className="sticky top-0 z-[100] w-full bg-white/90 dark:bg-[#111623]/90 backdrop-blur-md border-b border-slate-200 dark:border-[#1e293b] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            {/* Logo Section */}
            <Link to="/" className="flex items-center">
              <img src="/logo/logo_light.png" alt="Job Intel Logo" className="h-13 dark:hidden" />
              <img src="/logo/logo_dark.png" alt="Job Intel Logo" className="h-13 hidden dark:block" />
            </Link>

            {/* Navigation and Actions */}
            <div className="flex items-center gap-8">
              {/* Center Links */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary font-medium text-[15px] transition-colors px-4 py-2" to="/about">About Us</Link>
                <Link className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary font-medium text-[15px] transition-colors px-4 py-2" to="/contact">Contact</Link>
              </nav>

              {/* Right Side Actions */}
              <div className="flex items-center gap-6">
                {/* Language Icon */}
                <button className="text-slate-500 hover:text-primary transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">translate</span>
                </button>

                {/* Dark Mode Toggle */}
                <button
                  className="text-slate-500 hover:text-primary transition-colors flex items-center justify-center"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 0" }}>
                    {theme === "dark" ? "light_mode" : "dark_mode"}
                  </span>
                </button>

                {/* Divider */}
                <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>

                {/* Login & CTA */}
                <div className="flex items-center gap-5">
                  <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary font-medium text-[15px] hidden sm:block transition-colors">Log In</Link>
                  <Link to="/signup" className="flex items-center justify-center bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg text-[15px] font-medium transition-colors shadow-sm">
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative w-full h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuAyPPnPajBOxqF7d6G01lCvj3BqlFcT2ZphScMcf42DPaUS8QCyauUY2wrMoFG_HfbFNFkLwFTUDCFB-ZlHPUklmZuGqjbQgGOf-mraeRY52Hjaht-9yH-E1_-A_ylm8frEWLGXsNocIoltfOTTyesFjkpZtKlhXdHyl2W6ZDLhjtYTh6b5CxoP5vMnrMZQ9VHey_xrXkiDrtPUUJ0p-0amaddg2I7qNuqlAZOd3xEheXdR39_ogKnK9ssF6wdNYTR0pgRH1t0XKUdz')] bg-cover bg-center bg-fixed"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background-dark/90 via-background-dark/70 to-transparent"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <div className="max-w-2xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#302820] border border-[#503b25] text-sm text-[#a49f9a] font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              <span className="text-[13px]">Reimagining Recruitment</span>
            </div>
            <h1 className="text-5xl md:text-[64px] font-bold text-white leading-[1.05] mb-6 tracking-tight">
              Empowering<br />
              Careers through<br />
              <span className="text-primary">Data </span><span className="text-[#8BB8E8]">Intelligence</span>
            </h1>
            <p className="text-[17px] text-slate-300 leading-relaxed max-w-[460px] mb-8 font-light">
              Job Intel bridges the gap between ambition and opportunity. We use ethical AI and human insight to create a transparent, efficient job market for everyone.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })} className="bg-primary hover:bg-primary-dark text-white text-lg font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-primary/30 flex items-center gap-2 group">
                <span>Our Mission</span>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_downward</span>
              </button>
              <Link to="/signup" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-lg font-semibold px-8 py-3.5 rounded-xl border border-white/20 transition-all flex items-center gap-2">
                <span>View Openings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <section className="relative z-20 mt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
          <div className="flex items-center gap-6 p-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-primary">
              <span className="material-symbols-outlined text-4xl">work_history</span>
            </div>
            <div>
              <span className="block text-4xl font-black text-slate-900 dark:text-white">10k+</span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">Successful Job Matches</span>
            </div>
          </div>
          <div className="flex items-center gap-6 p-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl text-purple-600 dark:text-purple-400">
              <span className="material-symbols-outlined text-4xl">apartment</span>
            </div>
            <div>
              <span className="block text-4xl font-black text-slate-900 dark:text-white">500+</span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">Partner Companies</span>
            </div>
          </div>
          <div className="flex items-center gap-6 p-4 md:border-r border-slate-200 dark:border-slate-700">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <span className="material-symbols-outlined text-4xl">sentiment_satisfied</span>
            </div>
            <div>
              <span className="block text-4xl font-black text-slate-900 dark:text-white">98%</span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">User Satisfaction Rate</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background-light dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm">
                <span className="w-8 h-0.5 bg-primary"></span>
                <span>Our Core Purpose</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                We are democratizing access to professional growth.
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                At Job Intel, we believe that talent is equally distributed, but opportunity is not. Our platform leverages advanced analytics to level the playing field, giving every candidate the insights they need to succeed and every company the tools to find the perfect fit without bias.
              </p>
              <div className="grid sm:grid-cols-2 gap-6 mt-8">
                <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-2xl">target</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Our Mission</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">To make job market intelligence accessible, transparent, and actionable for everyone, everywhere.</p>
                </div>
                <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-2xl">visibility</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Our Vision</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">A world where talent meets opportunity instantly, powered by ethical AI and human insight.</p>
                </div>
              </div>
            </div>
            <div className="relative lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
              <img alt="Office collaboration" className="absolute inset-0 w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyPPnPajBOxqF7d6G01lCvj3BqlFcT2ZphScMcf42DPaUS8QCyauUY2wrMoFG_HfbFNFkLwFTUDCFB-ZlHPUklmZuGqjbQgGOf-mraeRY52Hjaht-9yH-E1_-A_ylm8frEWLGXsNocIoltfOTTyesFjkpZtKlhXdHyl2W6ZDLhjtYTh6b5CxoP5vMnrMZQ9VHey_xrXkiDrtPUUJ0p-0amaddg2I7qNuqlAZOd3xEheXdR39_ogKnK9ssF6wdNYTR0pgRH1t0XKUdz" />
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <blockquote className="text-2xl font-medium italic mb-4">"Job Intel didn't just find me a job; it helped me understand my worth in the market."</blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                    <img alt="User testimonial" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBmyzwzQvNTKExTjYh2L8RGkm7uLlnxb1xE6xERc6IvKa3f5vUYPFfa4pA0sfxp0cO5eDm63-nejAXcYV9GXkhSnYdtbtbiGuFCOwB2tSY2SBtJsM2MiGuIzB_0HpAOLFWTJ7rane5ly4KmBe7S32s25htMgt60TpJWP9HdsCny1KFDBjog4nxIpQLpPFBrvoH6xW8rsBHk5Z2d10xLWj2QMFyaiyKnZ0Hk3eA_AZi38IA8bEIIvjDgaBcOwCseA5M0GXnZ83QDJeM" />
                  </div>
                  <div>
                    <div className="font-bold">Sarah Jenkins</div>
                    <div className="text-sm text-slate-300">Senior Data Analyst</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-surface-dark border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">Why Top Talent Chooses Job Intel</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">We're more than just a job board. We're your career intelligence partner.</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-background-dark transition-colors duration-300">
            <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 text-primary rounded-2xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-3xl">psychology</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Smart AI Matching</h3>
            <p className="text-slate-600 dark:text-slate-400">Our algorithms understand context, not just keywords, ensuring better fits.</p>
          </div>
          <div className="text-center p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-background-dark transition-colors duration-300">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-3xl">verified_user</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Verified Companies</h3>
            <p className="text-slate-600 dark:text-slate-400">Every company is vetted for culture, stability, and authentic opportunities.</p>
          </div>
          <div className="text-center p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-background-dark transition-colors duration-300">
            <div className="w-16 h-16 mx-auto bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-3xl">trending_up</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Growth Insights</h3>
            <p className="text-slate-600 dark:text-slate-400">Salary trends, skill gap analysis, and career pathing tools included.</p>
          </div>
          <div className="text-center p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-background-dark transition-colors duration-300">
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-3xl">lock</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Privacy First</h3>
            <p className="text-slate-600 dark:text-slate-400">Your data is yours. Control who sees your profile and when.</p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50 dark:bg-background-dark">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">Our Journey</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">From a garage idea to a global platform.</p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-slate-200 dark:bg-slate-800"></div>
            <div className="relative flex justify-between items-center w-full mb-12">
              <div className="w-5/12 text-right pr-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">The Inception</h3>
                <p className="text-slate-600 dark:text-slate-400">Founded in a small garage with a big idea: fixing the broken hiring process through transparency.</p>
              </div>
              <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full border-4 border-white dark:border-background-dark bg-primary shadow-lg z-10"></div>
              <div className="w-5/12 pl-8"></div>
            </div>
            <div className="relative flex justify-between items-center w-full mb-12">
              <div className="w-5/12 text-right pr-8"></div>
              <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full border-4 border-white dark:border-background-dark bg-slate-400 dark:bg-slate-600 shadow-lg z-10"></div>
              <div className="w-5/12 pl-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Series A Funding</h3>
                <p className="text-slate-600 dark:text-slate-400">Raised $15M to expand our AI capabilities and grow the team of data scientists.</p>
              </div>
            </div>
            <div className="relative flex justify-between items-center w-full">
              <div className="w-5/12 text-right pr-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Global Reach</h3>
                <p className="text-slate-600 dark:text-slate-400">Expanded operations to 3 continents, serving thousands of daily users and Fortune 500 companies.</p>
              </div>
              <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full border-4 border-white dark:border-background-dark bg-slate-400 dark:bg-slate-600 shadow-lg z-10"></div>
              <div className="w-5/12 pl-8"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-surface-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">Meet the Minds</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl">The passionate team of engineers, designers, and dreamers building the future of work.</p>
            </div>
            <Link className="hidden md:flex items-center gap-2 text-primary font-semibold hover:underline mt-4 md:mt-0" to="/about">
              View full team <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group relative overflow-hidden rounded-2xl bg-slate-50 dark:bg-background-dark p-6 text-center border border-slate-100 dark:border-slate-800 transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-6 border-4 border-primary/20 group-hover:border-primary transition-colors">
                <img alt="James Carter" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2VJQkixc4LnRNvebwV0LXbF45sGaZUe6n371Z1epscZFHJirXp8wiPcDnKSASLA4DnCfVR6KV4FJqML2-EzkM0WabXafsa-ehy2kIFb22jofkCkBMMBGjrOctybJOhoAYn4oFJtzPRzkL8cJCxd8K8H3ckdNVkum9l539odTMeygWjNzLZLji9Z3sNgfywmm8phrRfh2QbiABzGwl4XX0kJGe_9DLHJ9BVdOt5vIadpjgj0dLpGujGu9c3mCTZmux7ojbYLds4Zbu" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">James Carter</h4>
              <span className="text-primary font-medium text-sm block mb-4">CEO &amp; Founder</span>
              <p className="text-slate-500 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Passionate about connecting people.</p>
              <div className="flex justify-center gap-4 opacity-60 group-hover:opacity-100 transition-opacity">
                <Link className="text-slate-400 hover:text-primary" to="/about"><span className="material-symbols-outlined text-lg">public</span></Link>
                <Link className="text-slate-400 hover:text-primary" to="/about"><span className="material-symbols-outlined text-lg">mail</span></Link>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl bg-slate-50 dark:bg-background-dark p-6 text-center border border-slate-100 dark:border-slate-800 transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-6 border-4 border-slate-200 dark:border-slate-700 group-hover:border-primary transition-colors">
                <img alt="Sarah Lin" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBmyzwzQvNTKExTjYh2L8RGkm7uLlnxb1xE6xERc6IvKa3f5vUYPFfa4pA0sfxp0cO5eDm63-nejAXcYV9GXkhSnYdtbtbiGuFCOwB2tSY2SBtJsM2MiGuIzB_0HpAOLFWTJ7rane5ly4KmBe7S32s25htMgt60TpJWP9HdsCny1KFDBjog4nxIpQLpPFBrvoH6xW8rsBHk5Z2d10xLWj2QMFyaiyKnZ0Hk3eA_AZi38IA8bEIIvjDgaBcOwCseA5M0GXnZ83QDJeM" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Sarah Lin</h4>
              <span className="text-slate-500 dark:text-slate-400 font-medium text-sm block mb-4">CTO</span>
              <p className="text-slate-500 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Tech visionary and AI expert.</p>
              <div className="flex justify-center gap-4 opacity-60 group-hover:opacity-100 transition-opacity">
                <Link className="text-slate-400 hover:text-primary" to="/about"><span className="material-symbols-outlined text-lg">public</span></Link>
                <Link className="text-slate-400 hover:text-primary" to="/about"><span className="material-symbols-outlined text-lg">mail</span></Link>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl bg-slate-50 dark:bg-background-dark p-6 text-center border border-slate-100 dark:border-slate-800 transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-6 border-4 border-slate-200 dark:border-slate-700 group-hover:border-primary transition-colors">
                <img alt="David Chen" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUmU3UkIcb8kobPf1bar1JBfYNxrAFCTziE4nRTzEjczi13FhKeFXJiIFL-wbqC7R0VoI5yoBygDxcPEehBS9laDTQhB-lOtZTEdNnfdi5nDblBU6tGMXMb65OcQK1JmMNABKIUji1ef-4iw0W6-kdozFQxoTpIiRHqxJE5tSyy3bs8RNr_UvNLzU6WmAlgGRGR4KjQsOHsRYkM7YQkosOhEK6Mv0dA0ZEbYL2kZAMOJQTmlN31XtXSf0cJ8i4xw3_rokTQw_3A94v" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">David Chen</h4>
              <span className="text-slate-500 dark:text-slate-400 font-medium text-sm block mb-4">Product Lead</span>
              <p className="text-slate-500 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Building products users love.</p>
              <div className="flex justify-center gap-4 opacity-60 group-hover:opacity-100 transition-opacity">
                <Link className="text-slate-400 hover:text-primary" to="/about"><span className="material-symbols-outlined text-lg">public</span></Link>
                <Link className="text-slate-400 hover:text-primary" to="/about"><span className="material-symbols-outlined text-lg">mail</span></Link>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl bg-slate-50 dark:bg-background-dark p-6 text-center border border-slate-100 dark:border-slate-800 transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-6 border-4 border-slate-200 dark:border-slate-700 group-hover:border-primary transition-colors">
                <img alt="Emily Rose" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAe402K0yD-MgS6k7Hu25NWw2KcwP43rYyeJ6kmWK_pV-5Rw3uh445GZBOzuf0RVZ4yErVwfvnVhvAU8nI5C_Dx7YaUbX8vX6N7HCWDqqVB0Qus3oi6QF-pR6zU_nkS2iPdUTVtfcnvPYKFyqiWS54q71R6P2YQuV-gRekrEYrsKWJ9DBkqYAOmILE4qhgP2yXEcG_ssuELx2pFq_5oQMn8MrWP_I4Cpl0ptHcUtYyBIn9SFHB0DE_tYeT3r32u9u_HUh4oT3ID9KgS" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Emily Rose</h4>
              <span className="text-slate-500 dark:text-slate-400 font-medium text-sm block mb-4">Head of Design</span>
              <p className="text-slate-500 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Designing for clarity and joy.</p>
              <div className="flex justify-center gap-4 opacity-60 group-hover:opacity-100 transition-opacity">
                <Link className="text-slate-400 hover:text-primary" to="/about"><span className="material-symbols-outlined text-lg">public</span></Link>
                <Link className="text-slate-400 hover:text-primary" to="/about"><span className="material-symbols-outlined text-lg">mail</span></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-900 z-0"></div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl z-0"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-black/20 rounded-full blur-3xl z-0"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-12 lg:p-20 gap-12">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl lg:text-5xl font-black text-white mb-6 leading-tight">Ready to transform your career path?</h2>
              <p className="text-blue-100 text-lg lg:text-xl max-w-xl mb-8">Join thousands of professionals finding their dream jobs with Job Intel's advanced matching technology.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link to="/signup" className="flex items-center justify-center gap-2 bg-white text-primary font-bold py-4 px-8 rounded-xl shadow-xl hover:bg-slate-50 hover:shadow-2xl hover:-translate-y-1 transition-all">
                  <span>Join the Network</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <button className="bg-transparent border border-white/30 text-white font-semibold py-4 px-8 rounded-xl hover:bg-white/10 transition-colors">
                  Contact Sales
                </button>
              </div>
            </div>
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl w-full max-w-sm rotate-3 hover:rotate-0 transition-transform duration-500 shadow-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-400"></div>
                  <div>
                    <div className="h-2 w-24 bg-white/50 rounded mb-1"></div>
                    <div className="h-2 w-16 bg-white/30 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-white/20 rounded"></div>
                  <div className="h-2 w-full bg-white/20 rounded"></div>
                  <div className="h-2 w-2/3 bg-white/20 rounded"></div>
                </div>
                <div className="mt-6 flex justify-between items-center">
                  <div className="h-8 w-24 bg-primary rounded-lg"></div>
                  <div className="text-white text-xs">Just Now</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <img src="/logo/logo_light.png" alt="Job Intel Logo" className="h-10 dark:hidden" />
                <img src="/logo/logo_dark.png" alt="Job Intel Logo" className="h-10 hidden dark:block" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                Making the job market transparent, efficient, and fair for everyone.
              </p>
              <div className="flex gap-4">
                <Link className="text-slate-400 hover:text-primary transition-colors" to="/about"><span className="material-symbols-outlined">public</span></Link>
                <Link className="text-slate-400 hover:text-primary transition-colors" to="/about"><span className="material-symbols-outlined">mail</span></Link>
                <Link className="text-slate-400 hover:text-primary transition-colors" to="/about"><span className="material-symbols-outlined">chat_bubble</span></Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Platform</h4>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <li><Link className="hover:text-primary transition-colors" to="/about">Find Jobs</Link></li>
                <li><Link className="hover:text-primary transition-colors" to="/about">Browse Companies</Link></li>
                <li><Link className="hover:text-primary transition-colors" to="/about">Salaries</Link></li>
                <li><Link className="hover:text-primary transition-colors" to="/about">Success Stories</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <li><Link className="hover:text-primary transition-colors" to="/about">About Us</Link></li>
                <li><Link className="hover:text-primary transition-colors" to="/about">Careers</Link></li>
                <li><Link className="hover:text-primary transition-colors" to="/about">Press</Link></li>
                <li><Link className="hover:text-primary transition-colors" to="/about">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <li><Link className="hover:text-primary transition-colors" to="/about">Privacy Policy</Link></li>
                <li><Link className="hover:text-primary transition-colors" to="/about">Terms of Service</Link></li>
                <li><Link className="hover:text-primary transition-colors" to="/about">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500 dark:text-slate-600">
              © {new Date().getFullYear()} Job Intel Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
