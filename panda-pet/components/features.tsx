export function Features() {
  return (
    <section className="mt-24 pb-12">
      <div className="grid md:grid-cols-3 gap-8">
        <FeatureCard
          title="Daily Bamboo Rewards"
          description="Log in every day to receive fresh bamboo and special treats for your pandas!"
          emoji="�"
        />
        <FeatureCard
          title="Panda Mini Games"
          description="Play fun panda-themed games to earn bamboo coins and unlock rare items!"
          emoji="🎮"
        />
        <FeatureCard
          title="Panda Community"
          description="Trade items with friends and show off your adorable panda collection!"
          emoji="🐼"
        />
      </div>
    </section>
  )
}

function FeatureCard({ title, description, emoji }: { title: string; description: string; emoji: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
      <div className="text-5xl mb-4">{emoji}</div>
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
