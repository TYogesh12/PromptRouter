import ClientLayout from "@/app/(main)/ClientLayout";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientLayout>{children}</ClientLayout>
  );
}
