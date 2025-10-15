export function Hero() {
  return (
    <div className="space-y-8">
      <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight text-balance flex items-center gap-4 flex-wrap">
        <span className="text-6xl">🐼</span>
        Welcome to Panda Pet World!
      </h1>

      <div className="space-y-6">
        <FeatureItem
          icon="�"
          title="Adopt Your Panda!"
          description="Choose from 8 magical panda species! Feed them bamboo, play together, and watch them grow into happy companions"
        />

        <FeatureItem
          icon="🎋"
          title="Bamboo Forest Adventure"
          description="Explore enchanted bamboo forests, discover hidden treasures, and meet other adorable pandas in this magical world!"
        />

        <FeatureItem
          icon="🎁"
          title="Collect & Customize"
          description="Gather bamboo treats, cute accessories, and special items. Dress up your pandas and make them uniquely yours!"
        />

        <FeatureItem
          icon="✨"
          title="Completely Free"
          description="Simply create a free account and begin your adventure into the world of PetWorld!"
        />
      </div>
    </div>
  )
}

function FeatureItem({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="text-4xl flex-shrink-0">{icon}</div>
      <div>
        <h3 className="text-xl font-bold text-foreground mb-1">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
