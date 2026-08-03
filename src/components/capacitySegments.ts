import {
  BriefcaseBusiness,
  CalendarRange,
  CircleCheckBig,
  Coffee,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import type { SegmentKey } from "../types";

export type CapacitySegment = {
  key: SegmentKey;
  icon: LucideIcon;
  textClass: string;
  softClass: string;
  barClass: string;
};

export const CAPACITY_SEGMENTS: CapacitySegment[] = [
  {
    key: "available",
    icon: CircleCheckBig,
    textClass: "text-capacity-available",
    softClass: "bg-capacity-available-soft text-capacity-available",
    barClass: "bg-capacity-available",
  },
  {
    key: "leave",
    icon: CalendarRange,
    textClass: "text-capacity-leave",
    softClass: "bg-capacity-leave-soft text-capacity-leave",
    barClass: "bg-capacity-leave",
  },
  {
    key: "rtt",
    icon: Coffee,
    textClass: "text-capacity-rtt",
    softClass: "bg-capacity-rtt-soft text-capacity-rtt",
    barClass: "bg-capacity-rtt",
  },
  {
    key: "training",
    icon: GraduationCap,
    textClass: "text-capacity-training",
    softClass: "bg-capacity-training-soft text-capacity-training",
    barClass: "bg-capacity-training",
  },
  {
    key: "other",
    icon: BriefcaseBusiness,
    textClass: "text-capacity-other",
    softClass: "bg-capacity-other-soft text-capacity-other",
    barClass: "bg-capacity-other",
  },
];

export const ABSENCE_SEGMENTS = CAPACITY_SEGMENTS.filter(
  (
    segment,
  ): segment is CapacitySegment & {
    key: Exclude<SegmentKey, "available">;
  } => segment.key !== "available",
);
