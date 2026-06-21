import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Radja Bekam Admin & Clinic',
    short_name: 'Radja Bekam',
    description: 'Aplikasi Reservasi & Manajemen Klinik Radja Bekam',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/logo.png',
        sizes: 'any',
        type: 'image/png',
      },
      // Idealnya tambahkan icon 192x192 dan 512x512 berformat kotak di masa mendatang
    ],
  };
}
