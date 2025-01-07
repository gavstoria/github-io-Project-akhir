import {
  FaceSmileIcon,
  ChartBarSquareIcon,
  CursorArrowRaysIcon,
  DevicePhoneMobileIcon,
  AdjustmentsHorizontalIcon,
  SunIcon,
} from "@heroicons/react/24/solid";

import benefitOneImg from "../../public/img/benefit-one.png";
import benefitTwoImg from "../../public/img/benefit-two.png";

const benefitOne = {
  title: "Keuntungan Menggunakan BizPlanner",
  desc: "Dengan menggunakan BizPlanner anda akan mudah mengetahui bisnis yang akan anda mulai dengan menggunakan Fitur Utama kami, Seperti :",
  image: benefitOneImg,
  bullets: [
    {
      title: "Ramah Pemula",
      desc: "Cocok untuk semua, bahkan yang baru pertama kali memulai bisnis .",
      icon: <FaceSmileIcon />,
    },
    {
      title: "Perhitungan Cepat dan Akurat",
      desc: "Membantu user menghitung modal awal, titik impas (BEP), dan proyeksi finansial dengan cepat dan tepat tanpa perlu keahlian akuntansi.",
      icon: <ChartBarSquareIcon />,
    },
    {
      title: "Hemat Waktu",
      desc: "Tidak perlu hitungan rumit, semua otomatis..",
      icon: <CursorArrowRaysIcon />,
    },
  ],
};

const benefitTwo = {
  title: "Apa Fitur Fitur utama kami?",
  desc: "Berikut adalah Fitur fitur Utama kami",
  image: benefitTwoImg,
  bullets: [
    {
      title: "Hitung Modal Awal",
      desc: "Masukkan data dan temukan modal yang Anda butuhkan.",
      icon: <DevicePhoneMobileIcon />,
    },
    {
      title: "Analisis BEP",
      desc: "Ketahui kapan bisnis Anda mencapai titik impas.",
      icon: <AdjustmentsHorizontalIcon />,
    },
    {
      title: "Dark & Light Mode",
      desc: "Terdapat mode terang dan gelap untuk anda yang punya selera. ",
      icon: <SunIcon />,
    },
  ],
};


export {benefitOne, benefitTwo};
