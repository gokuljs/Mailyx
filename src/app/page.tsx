import { BackgroundBeams } from "./_components/background-beams";
import Footer from "./_components/footer";
import { GlowingEffect } from "./_components/glowing-effect";
import NavBar from "./_components/navbar";
import ParticlesBackground from "./_components/Particles";
import StartMailyxButton from "./_components/StartMailyxButton";
import Video from "./_components/Video";

export default async function Home() {
  return (
    <>
      <>
        <div className="relative z-10 flex min-h-screen flex-col items-center bg-black pt-60 md:px-0">
          <NavBar />
          <ParticlesBackground />
          <h1 className="inline-block bg-linear-to-br from-white to-stone-500 bg-clip-text px-2 text-center text-4xl font-bold text-transparent md:px-0 md:text-6xl">
            Mailyx — A minimalist <br />
            AI-powered email client
          </h1>
          <div className="h-4"></div>
          <p className="mb-8 max-w-xl px-3 text-center text-lg text-stone-600 md:px-0 md:text-xl">
            A calm, modern email client designed for clarity and focus, not
            clutter.
          </p>
          <div className="h-8"></div>
          <div className="space-x-4">
            <StartMailyxButton text="Start Using Mailyx" />
          </div>
          <div className="mx-auto mt-12 max-w-5xl">
            <h2 className="mb-8 bg-linear-to-b from-white to-stone-600 bg-clip-text text-center text-3xl font-semibold text-transparent md:text-4xl">
              Experience the power of
            </h2>

            <div className="grid grid-cols-1 gap-4 px-5 md:grid-cols-3">
              <div className="rounded-2.5xl relative h-full border border-neutral-500 p-2 md:rounded-3xl md:p-3">
                <GlowingEffect
                  borderWidth={2}
                  spread={100}
                  glow={true}
                  disabled={false}
                  proximity={180} // Responsive to mouse proximity
                  inactiveZone={0.1}
                  variant="white"
                />
                <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl bg-black p-6 shadow-[0px_0px_27px_0px_#2D2D2D] md:p-6">
                  <div className="relative flex flex-1 flex-col justify-between gap-3">
                    <div className="space-y-3">
                      <h3 className="-tracking-4 pt-0.5 font-sans text-xl font-semibold text-balance text-white md:text-2xl/[1.875rem]">
                        AI-prioritized Inbox
                      </h3>
                      <h2 className="font-sans text-sm/[1.125rem] text-gray-500 md:text-base/[1.375rem] md:[&_b]:font-semibold md:[&_strong]:font-semibold">
                        See what matters first — Mailyx automatically highlights
                        your most important emails so you stay focused.
                      </h2>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-2.5xl relative h-full border border-neutral-500 p-2 md:rounded-3xl md:p-3">
                <GlowingEffect
                  borderWidth={3}
                  spread={50}
                  glow={true}
                  disabled={false}
                  proximity={80}
                  inactiveZone={0.1}
                  variant="white"
                />
                <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl bg-black p-6 shadow-[0px_0px_27px_0px_#2D2D2D] md:p-6">
                  <div className="relative flex flex-1 flex-col justify-between gap-3">
                    <div className="space-y-3">
                      <h3 className="-tracking-4 pt-0.5 font-sans text-xl font-semibold text-balance text-white md:text-2xl/[1.875rem]">
                        Precision Search
                      </h3>
                      <h2 className="font-sans text-sm/[1.125rem] text-gray-500 md:text-base/[1.375rem] md:[&_b]:font-semibold md:[&_strong]:font-semibold">
                        Instantly search your entire inbox with AI-enhanced
                        speed, context, and clarity.
                      </h2>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-2.5xl border-neutral-500p-2 relative h-full border border-neutral-500 md:rounded-3xl md:p-3">
                <GlowingEffect
                  borderWidth={3}
                  spread={50}
                  glow={true}
                  disabled={false}
                  proximity={80} // Responsive to mouse proximity
                  inactiveZone={0.1}
                  variant="white"
                />
                <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl bg-black p-6 shadow-[0px_0px_27px_0px_#2D2D2D] md:p-6">
                  <div className="relative flex flex-1 flex-col justify-between gap-3">
                    <div className="space-y-3">
                      <h3 className="-tracking-4 pt-0.5 font-sans text-xl font-semibold text-balance text-white md:text-2xl/[1.875rem]">
                        Keyboard-first Navigation
                      </h3>
                      <h2 className="font-sans text-sm/[1.125rem] text-gray-500 md:text-base/[1.375rem] md:[&_b]:font-semibold md:[&_strong]:font-semibold">
                        Navigate through your inbox effortlessly using
                        intuitive, lightning-fast keyboard shortcuts — no mouse
                        required.
                      </h2>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-20 max-w-5xl">
            <h2 className="mb-8 bg-linear-to-b from-white to-stone-600 bg-clip-text text-center text-3xl font-semibold text-transparent md:text-4xl">
              Watch the demo
            </h2>
          </div>
          <Video />
          <div className="z-50 w-full bg-transparent">
            <Footer />
          </div>
        </div>
      </>
    </>
  );
}
