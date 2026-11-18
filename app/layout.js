import './globals.css';

export const metadata = {
  title: 'ScholarBeacon Admin Portal',
  description: 'Manage scholarships, internships, official sources, and monitor crawler review queues.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>{children}</body>
    </html>
  );
}

