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
          elements: {
            card: 'backdrop-blur bg-white/10 border border-white/10 shadow-xl rounded-xl',
          },
          variables: { colorPrimary: '#2F4D46' },
        }}
      />
    </div>
  );
}
