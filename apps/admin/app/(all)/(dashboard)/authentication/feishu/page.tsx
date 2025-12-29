import { useState } from "react";
import { observer } from "mobx-react";
import useSWR from "swr";
// plane internal packages
import { setPromiseToast } from "@plane/propel/toast";
import { Loader, ToggleSwitch } from "@plane/ui";
// assets
import feishuLogo from "@/app/assets/logos/feishu-logo.svg?url";
// components
import { AuthenticationMethodCard } from "@/components/authentication/authentication-method-card";
import { PageWrapper } from "@/components/common/page-wrapper";
// hooks
import { useInstance } from "@/hooks/store";
// local
import { InstanceFeishuConfigForm } from "./form";

const InstanceFeishuAuthenticationPage = observer(function InstanceFeishuAuthenticationPage() {
  // store
  const { fetchInstanceConfigurations, formattedConfig, updateInstanceConfigurations } = useInstance();
  // state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // config
  const enableFeishuConfig = formattedConfig?.IS_FEISHU_ENABLED ?? "";
  useSWR("INSTANCE_CONFIGURATIONS", () => fetchInstanceConfigurations());

  const updateConfig = async (key: "IS_FEISHU_ENABLED", value: string) => {
    setIsSubmitting(true);

    const payload = {
      [key]: value,
    };

    const updateConfigPromise = updateInstanceConfigurations(payload);

    setPromiseToast(updateConfigPromise, {
      loading: "Saving Configuration",
      success: {
        title: "Configuration saved",
        message: () => `Feishu authentication is now ${value === "1" ? "active" : "disabled"}.`,
      },
      error: {
        title: "Error",
        message: () => "Failed to save configuration",
      },
    });

    await updateConfigPromise
      .then(() => {
        setIsSubmitting(false);
        return undefined;
      })
      .catch((err) => {
        console.error(err);
        setIsSubmitting(false);
        return undefined;
      });
  };

  const isFeishuEnabled = enableFeishuConfig === "1";

  return (
    <PageWrapper
      customHeader={
        <AuthenticationMethodCard
          name="Feishu"
          description="Allow members to login or sign up to plane with their Feishu accounts."
          icon={<img src={feishuLogo} height={24} width={24} alt="Feishu Logo" />}
          config={
            <ToggleSwitch
              value={isFeishuEnabled}
              onChange={() => {
                void updateConfig("IS_FEISHU_ENABLED", isFeishuEnabled ? "0" : "1");
              }}
              size="sm"
              disabled={isSubmitting || !formattedConfig}
            />
          }
          disabled={isSubmitting || !formattedConfig}
          withBorder={false}
        />
      }
    >
      {formattedConfig ? (
        <InstanceFeishuConfigForm config={formattedConfig} />
      ) : (
        <Loader className="space-y-8">
          <Loader.Item height="50px" width="25%" />
          <Loader.Item height="50px" />
          <Loader.Item height="50px" />
          <Loader.Item height="50px" />
          <Loader.Item height="50px" width="50%" />
        </Loader>
      )}
    </PageWrapper>
  );
});

export default InstanceFeishuAuthenticationPage;

