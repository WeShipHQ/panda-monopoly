import Link from "next/link"
import { Card } from "./card"

interface PetCardProps {
  name: string
  description: string
  image: string
  href?: string
}

export function PetCard({ name, description, image, href }: PetCardProps) {
  const Content = (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/50">
      <div className="aspect-square  flex items-center justify-center  ">
        <img 
          src={image} 
          alt={`${name} Preview`} 
          draggable={false}
          className="w-full h-full object-contain drop-shadow-xl transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <div className="p-6 space-y-2">
        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {description}
        </p>
      </div>
    </Card>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {Content}
      </Link>
    )
  }

  return Content
}
