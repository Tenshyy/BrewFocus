"use client";

import { useFeatureStore } from "@/stores/featureStore";
import type { FeatureId } from "@/types/features";

interface FeatureGateProps {
  feature: FeatureId;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
  const enabled = useFeatureStore((s) => s.features[feature]);
  return enabled ? <>{children}</> : <>{fallback}</>;
}

export function useFeatureEnabled(feature: FeatureId): boolean {
  return useFeatureStore((s) => s.features[feature]);
}
