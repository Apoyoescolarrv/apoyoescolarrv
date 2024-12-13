export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full lg:grid lg:grid-cols-2 h-screen">
      <div className="flex items-center justify-center py-12">{children}</div>
      <div className="hidden relative lg:block bg-gradient-to-br from-primary to-secondary-foreground rounded-tl-3xl rounded-bl-3xl my-3">
        <h2 className="text-primary-foreground text-4xl font-semibold absolute top-1/3 -translate-y-1/3 left-1/2 -translate-x-1/2">
          ApoyoEscolar RV
        </h2>
      </div>
    </div>
  );
}
