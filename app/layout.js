export const metadata = {
  title: "AI IT Support Assistant",
  description: "AI-powered IT support automation demo — TechNova Solutions",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif", background: "#F7F5FB" }}>
        {children}
      </body>
    </html>
  );
}
