// src/pages/IDXSearch.tsx
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";

const IDXSearch = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FloatingContact />

      {/* Header */}
      <section className="pt-32 pb-8 bg-gradient-to-br from-primary via-primary-dark to-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            MLS Property Search
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-primary-foreground/90">
            Search thousands of properties directly from the Multiple Listing Service
          </p>
        </div>
      </section>

      {/* FlexMLS IDX Widget */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <iframe 
              src="https://link.flexmls.com/1lpm0zo1944e,12" 
              frameBorder="0" 
              width="100%" 
              height="850"
              title="FlexMLS Property Search"
              className="w-full"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default IDXSearch;
