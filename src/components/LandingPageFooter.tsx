import Link from "next/link";

const columns = [
  {
    title: "Product",
    links: ["Product", "Pricing", "Security", "Integrations"],
  },
  {
    title: "Company",
    links: ["About", "Customers", "Careers", "Contact"],
  },
  {
    title: "Resources",
    links: ["Documentation", "Guides", "Support", "Changelog"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "DPA", "Status"],
  },
];

const hrefFor = (label: string) => {
  const routes: Record<string, string> = {
    Product: "/product",
    Pricing: "/pricing",
    About: "/about",
    Contact: "/contact",
  };

  return routes[label] ?? "#";
};

export const LandingPageFooter = () => {
  return (
    <footer className="w-full border-t border-neutral-200 bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="flex flex-col justify-between gap-12 md:flex-row">
          <div className="max-w-xs">
            <Link href="/" className="text-lg font-semibold tracking-tight text-black">
              Frameport
            </Link>
            <p className="mt-4 text-sm leading-6 text-neutral-500">
              Work with clients, not around them.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-10 sm:grid-cols-4">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-semibold text-black">{column.title}</h3>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link}>
                      <Link href={hrefFor(link)} className="text-sm text-neutral-500 transition-colors hover:text-black">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-neutral-100 pt-6 text-sm text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Frameport, Inc.</span>
          <span>Built for teams who care about the work.</span>
        </div>
      </div>
    </footer>
  );
};
