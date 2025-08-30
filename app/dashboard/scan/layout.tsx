export default function ScanLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quick Scan</h1>
        <p className="text-muted-foreground">
          Scan QR codes for asset operations
        </p>
      </div>
      {children}
    </div>
  )
}
