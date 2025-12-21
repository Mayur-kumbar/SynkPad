import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Layers, Zap, Pencil, Clock, FileDown } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Layers className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">SynkPad</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get started — it's free
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6">
        <div className="flex flex-col items-center py-20 text-center">
          <h1 className="mb-4 max-w-4xl text-5xl font-bold leading-tight text-foreground text-balance">
            Real-time collaborative documents & whiteboards for teams
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-muted-foreground text-pretty">
            Create, collaborate, and visualize your ideas in one unified workspace. No context switching, just seamless
            teamwork.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Get started — it's free
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 pb-20 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<Zap className="h-6 w-6 text-primary" />}
            title="Realtime editing"
            description="See changes as they happen. Multiple cursors, live presence, instant sync."
          />
          <FeatureCard
            icon={<Pencil className="h-6 w-6 text-primary" />}
            title="Whiteboard canvas"
            description="Draw, sketch, and visualize ideas with powerful canvas tools."
          />
          <FeatureCard
            icon={<Clock className="h-6 w-6 text-primary" />}
            title="Version history"
            description="Never lose work. Restore any version with full snapshot history."
          />
          <FeatureCard
            icon={<FileDown className="h-6 w-6 text-primary" />}
            title="Export as PDF"
            description="Share your work anywhere. Export documents and boards as PDF or PNG."
          />
        </div>

        {/* CTA Section */}
        <div className="mb-20 rounded-lg border border-border bg-card p-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground text-balance">
            Ready to transform your team's workflow?
          </h2>
          <p className="mb-6 text-muted-foreground text-pretty">
            Join thousands of teams already collaborating on SynkPad.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Get started — it's free
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          © 2025 SynkPad. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
