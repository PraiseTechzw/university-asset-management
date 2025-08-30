export default function IssueLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Asset Issues</h1>
        <p className="text-muted-foreground">
          Manage asset assignments and returns
        </p>
      </div>
      {children}
    </div>
  )
}
