export default function AssetsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Asset Management</h1>
        <p className="text-muted-foreground">
          Manage and track all university assets
        </p>
      </div>
      {children}
    </div>
  )
}
