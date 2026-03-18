"use client";

import { useTranslations } from "next-intl";
import { useFeatureStore } from "@/stores/featureStore";
import { FEATURE_REGISTRY, FEATURE_GROUPS } from "@/lib/featureRegistry";
import type { FeatureId, FeatureGroup } from "@/types/features";
import LucideIcon from "@/components/ui/LucideIcon";

const GROUP_ICONS: Record<FeatureGroup, string> = {
  core: "star",
  experience: "palette",
  organization: "folder-kanban",
  input: "inbox",
  motivation: "rocket",
};

export default function FeaturesSettings() {
  const t = useTranslations("features");
  const { features, toggle, resetDefaults } = useFeatureStore();

  return (
    <div className="space-y-5">
      {FEATURE_GROUPS.map((group) => {
        const groupFeatures = FEATURE_REGISTRY.filter((f) => f.group === group);
        if (groupFeatures.length === 0) return null;

        return (
          <div key={group}>
            <h3 className="text-[10px] font-bold uppercase tracking-[2px] text-brew-gray/60 mb-2 flex items-center gap-1.5">
              <LucideIcon name={GROUP_ICONS[group]} size={12} />
              {t(`group${group.charAt(0).toUpperCase()}${group.slice(1)}`)}
            </h3>
            <div className="space-y-1">
              {groupFeatures.map((feature) => (
                <FeatureRow
                  key={feature.id}
                  id={feature.id}
                  icon={feature.icon}
                  label={t(`${feature.id}Label`)}
                  description={t(`${feature.id}Desc`)}
                  enabled={features[feature.id]}
                  onToggle={() => toggle(feature.id)}
                />
              ))}
            </div>
          </div>
        );
      })}

      <button
        onClick={resetDefaults}
        className="w-full text-[10px] font-bold uppercase tracking-[2px] text-brew-gray hover:text-brew-cream py-2 border border-brew-border rounded transition-colors cursor-pointer"
      >
        {t("resetDefaults")}
      </button>
    </div>
  );
}

function FeatureRow({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  id,
  icon,
  label,
  description,
  enabled,
  onToggle,
}: {
  id: FeatureId;
  icon: string;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer hover:bg-brew-orange/5"
    >
      <span className="w-6 text-center flex-shrink-0">
        <LucideIcon name={icon} size={16} />
      </span>
      <div className="flex-1 text-left min-w-0">
        <div className="text-xs text-brew-cream truncate">{label}</div>
        <div className="text-[10px] text-brew-gray/50 truncate">{description}</div>
      </div>
      {/* Toggle switch */}
      <div
        className={`relative w-9 h-5 rounded-full flex-shrink-0 transition-colors ${
          enabled ? "bg-brew-orange" : "bg-brew-border"
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-brew-cream shadow transition-transform ${
            enabled ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </div>
    </button>
  );
}
