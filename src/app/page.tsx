import { Container } from "@/components/Container";
import { Hero } from "@/components/Hero";
import { SectionTitle } from "@/components/SectionTitle";
import { Benefits } from "@/components/Benefits";
import { Video } from "@/components/Video";
import { Testimonials } from "@/components/Testimonials";
import { Faq } from "@/components/Faq";
import { Cta } from "@/components/Cta";

import { benefitOne, benefitTwo } from "@/components/data";
export default function Home() {
  return (
    <Container>
      <Hero />
      <SectionTitle
        preTitle="Selamat Datang"
        title="BizPlanner - Solusi Pengelolaan Bisnis Anda"
      >
        Platform manajemen bisnis yang membantu UMKM berkembang
      </SectionTitle>

      <Benefits data={benefitOne} />
      <Benefits imgPos="right" data={benefitTwo} />

      <SectionTitle
        preTitle="Tutorial"
        title="Pelajari Cara Menggunakan BizPlanner"
      >
        Lihat video panduan penggunaan fitur-fitur BizPlanner
      </SectionTitle>

      <Video videoId="fZ0D0cnR88E" />

      <SectionTitle
        preTitle="Testimoni" 
        title="Kisah Sukses Pengguna BizPlanner"
      >
        Dengarkan pengalaman langsung dari para pebisnis yang telah menggunakan BizPlanner
      </SectionTitle>

      <Testimonials />

      <SectionTitle 
        preTitle="FAQ" 
        title="Pertanyaan yang Sering Diajukan"
      >
        Temukan jawaban untuk pertanyaan umum seputar BizPlanner
      </SectionTitle>

      <Faq />
      <Cta />
    </Container>
  );
}
