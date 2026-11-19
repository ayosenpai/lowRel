import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import HomepageRenderer from "@/components/sections/homepage-renderer";
import { getHomepageSections } from "@/lib/actions/homepage";

export default async function Home() {
  const sections = await getHomepageSections();

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Header variant="transparent" />

      {/* Layout is controlled from /admin/homepage; this is the published version. */}
      <div>
        <HomepageRenderer sections={sections} />
      </div>

      <Footer />
    </main>
  );
}
