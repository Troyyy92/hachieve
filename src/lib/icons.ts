import {
  Briefcase, HeartPulse, Lightbulb, LineChart, Network, Scale, ShieldCheck, Users, LucideIcon
} from "lucide-react";

export const iconComponents: { [key: string]: LucideIcon } = {
  Users, Lightbulb, Network, HeartPulse, LineChart, Scale, Briefcase, ShieldCheck
};

export const iconNames = Object.keys(iconComponents);

export const getIconComponent = (name: string): LucideIcon => {
  return iconComponents[name] || Lightbulb;
};