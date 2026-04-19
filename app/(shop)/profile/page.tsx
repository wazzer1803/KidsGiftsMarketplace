import ProfileForm from "@/components/forms/profile-form";

export default function ProfilePage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Account</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">My Profile</h1>
      </div>
      <ProfileForm />
    </section>
  );
}
