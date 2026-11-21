import {
  BedDouble,
  Briefcase,
  Car,
  ConciergeBell,
  Dumbbell,
  GraduationCap,
  Hammer,
  HeartPulse,
  Scissors,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
  type LucideProps,
} from "lucide-react";
import type { CategoryIconName } from "@/types/category";

const ICONS: Record<CategoryIconName, React.ComponentType<LucideProps>> = {
  health: HeartPulse,
  food: UtensilsCrossed,
  shopping: ShoppingBag,
  home: Hammer,
  travel: BedDouble,
  car: Car,
  briefcase: Briefcase,
  beauty: Scissors,
  sports: Dumbbell,
  education: GraduationCap,
  sparkles: Sparkles,
  services: ConciergeBell,
};

export function CategoryIcon({ name, ...props }: { name: CategoryIconName } & LucideProps) {
  const Icon = ICONS[name];
  return <Icon aria-hidden {...props} />;
}
