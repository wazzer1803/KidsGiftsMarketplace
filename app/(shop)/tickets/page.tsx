import TicketCenter from "@/components/forms/ticket-center";
import { getAllProducts } from "@/lib/data";

export default async function TicketsPage() {
  const products = await getAllProducts(120);

  const options = products.map((item) => ({
    id: item._id.toString(),
    title: item.title
  }));

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Support</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">Tickets & Help</h1>
        <p className="mt-2 text-on-surface-variant">
          Create a ticket for order issues or product enquiries. Cart-linked products are attached automatically.
        </p>
      </div>

      <TicketCenter products={options} />
    </section>
  );
}
