import { observer } from "mobx-react";
import Link from "next/link";
// icons
import { Settings2 } from "lucide-react";
// plane internal packages
import { getButtonStyling } from "@plane/propel/button";
import type { TInstanceAuthenticationMethodKeys } from "@plane/types";
import { ToggleSwitch } from "@plane/ui";
import { cn } from "@plane/utils";
// hooks
import { useInstance } from "@/hooks/store";

type Props = {
  disabled: boolean;
  updateConfig: (key: TInstanceAuthenticationMethodKeys, value: string) => void;
};

export const FeishuConfiguration = observer(function FeishuConfiguration(props: Props) {
  const { disabled, updateConfig } = props;
  // store
  const { formattedConfig } = useInstance();
  // derived values
  const FeishuConfig = formattedConfig?.IS_FEISHU_ENABLED ?? "";
  const FeishuConfigured =
    !!formattedConfig?.FEISHU_APP_ID && !!formattedConfig?.FEISHU_APP_SECRET;

  return (
    <>
      {FeishuConfigured ? (
        <div className="flex items-center gap-4">
          <Link href="/authentication/feishu" className={cn(getButtonStyling("link", "base"), "font-medium")}>
            Edit
          </Link>
          <ToggleSwitch
            value={Boolean(parseInt(FeishuConfig))}
            onChange={() => {
              if (Boolean(parseInt(FeishuConfig)) === true) {
                void updateConfig("IS_FEISHU_ENABLED", "0");
              } else {
                void updateConfig("IS_FEISHU_ENABLED", "1");
              }
            }}
            size="sm"
            disabled={disabled}
          />
        </div>
      ) : (
        <Link href="/authentication/feishu" className={cn(getButtonStyling("secondary", "base"), "text-tertiary")}>
          <Settings2 className="h-4 w-4 p-0.5 text-tertiary" />
          Configure
        </Link>
      )}
    </>
  );
});

