import { SignIn } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* 🔵 Your background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-blue-900 to-slate-900" />
      <div
        className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)]"
        style={{ backgroundSize: '20px 20px' }}
      />

      {/* Clerk card – customise further with the appearance prop */}
      <SignIn
        appearance={{
          baseTheme: dark,
          variables: {
            colorBackground: '#1A1A1A', // Clerk uses this for its own surfaces
            colorPrimary: '#2F4D46', // (or whatever accent you picked)
          },
          elements: {
            /* NOTE
               ────────────────────────────────────────────
               - In Clerk < 4.8 the key is `card`
               - In Clerk 4.8+ (a.k.a. “Core v2”) it’s split
                 into `cardBox` + `footer`.
               - Keep whichever keys match your version.
            */
            cardBox:
              // glassy charcoal panel
              'backdrop-blur bg-[#1A1A1A]/60 ' + // translucent charcoal
              'border border-white/10 ' + // subtle hairline
              'shadow-xl shadow-black/50 ' + // deeper drop-shadow
              'rounded-xl',

            footer: 'bg-[#1A1A1A]/60 border-t border-white/10', // make footer match box
          },
        }}
      />
    </div>
  );
}
