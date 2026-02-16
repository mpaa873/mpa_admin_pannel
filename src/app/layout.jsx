import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReduxProvider from "../redux/provider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "MPA Admin",
  description: "Admin Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              // Global professional styling for all toasts
              duration: 3000,
              style: {
                background: "#333",
                color: "#fff",
                borderRadius: "10px",
              },
            }}
          />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
