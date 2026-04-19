import AdminConsole from "@/components/forms/admin-console";

export default function AdminPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Control Center</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">Admin Dashboard</h1>
        <p className="mt-2 text-on-surface-variant">
          Add categories, manage products, and handle tickets with a simple and responsive workflow.
        </p>
      </div>

      <AdminConsole />
    </section>
  );
}
