import LoginOtpForm from "@/components/forms/login-otp-form";

export default function LoginPage() {
  return (
    <section className="reveal-up mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Welcome Back</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-on-surface sm:text-5xl md:text-6xl">
          Email Password Login
        </h1>
        <p className="mt-3 text-on-surface-variant">
          Signup with phone, email, and password. Then login anytime with email and password.
        </p>
      </div>
      <LoginOtpForm />
    </section>
  );
}
