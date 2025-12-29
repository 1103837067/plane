import { useState } from "react";
import { isEmpty } from "lodash-es";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Monitor } from "lucide-react";
// plane internal packages
import { API_BASE_URL } from "@plane/constants";
import { Button, getButtonStyling } from "@plane/propel/button";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import type { IFormattedInstanceConfiguration, TInstanceFeishuAuthenticationConfigurationKeys } from "@plane/types";
// components
import { CodeBlock } from "@/components/common/code-block";
import { ConfirmDiscardModal } from "@/components/common/confirm-discard-modal";
import type { TControllerInputFormField } from "@/components/common/controller-input";
import { ControllerInput } from "@/components/common/controller-input";
import type { TControllerSwitchFormField } from "@/components/common/controller-switch";
import { ControllerSwitch } from "@/components/common/controller-switch";
import type { TCopyField } from "@/components/common/copy-field";
import { CopyField } from "@/components/common/copy-field";
// hooks
import { useInstance } from "@/hooks/store";

type Props = {
  config: IFormattedInstanceConfiguration;
};

type FeishuConfigFormValues = Record<TInstanceFeishuAuthenticationConfigurationKeys, string>;

export function InstanceFeishuConfigForm(props: Props) {
  const { config } = props;
  // states
  const [isDiscardChangesModalOpen, setIsDiscardChangesModalOpen] = useState(false);
  // store hooks
  const { updateInstanceConfigurations } = useInstance();
  // form data
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FeishuConfigFormValues>({
    defaultValues: {
      FEISHU_APP_ID: config["FEISHU_APP_ID"],
      FEISHU_APP_SECRET: config["FEISHU_APP_SECRET"],
      ENABLE_FEISHU_SYNC: config["ENABLE_FEISHU_SYNC"] || "0",
    },
  });

  const originURL = !isEmpty(API_BASE_URL) ? API_BASE_URL : typeof window !== "undefined" ? window.location.origin : "";

  const FEISHU_FORM_FIELDS: TControllerInputFormField[] = [
    {
      key: "FEISHU_APP_ID",
      type: "text",
      label: "App ID",
      description: (
        <>
          You will get this from your{" "}
          <a
            tabIndex={-1}
            href="https://open.feishu.cn/app"
            target="_blank"
            className="text-accent-primary hover:underline"
            rel="noreferrer"
          >
            Feishu Open Platform.
          </a>
        </>
      ),
      placeholder: "cli_a1b2c3d4e5f6g7h8",
      error: Boolean(errors.FEISHU_APP_ID),
      required: true,
    },
    {
      key: "FEISHU_APP_SECRET",
      type: "password",
      label: "App Secret",
      description: (
        <>
          Your app secret is also found in your{" "}
          <a
            tabIndex={-1}
            href="https://open.feishu.cn/app"
            target="_blank"
            className="text-accent-primary hover:underline"
            rel="noreferrer"
          >
            Feishu Open Platform.
          </a>
        </>
      ),
      placeholder: "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p",
      error: Boolean(errors.FEISHU_APP_SECRET),
      required: true,
    },
  ];

  const FEISHU_FORM_SWITCH_FIELD: TControllerSwitchFormField<FeishuConfigFormValues> = {
    name: "ENABLE_FEISHU_SYNC",
    label: "Feishu",
  };

  const FEISHU_SERVICE_DETAILS: TCopyField[] = [
    {
      key: "Callback_URI",
      label: "Callback URI",
      url: `${originURL}/auth/feishu/callback/`,
      description: (
        <p>
          We will auto-generate this. Paste this into your <CodeBlock darkerShade>Redirect URL</CodeBlock> field in{" "}
          <a
            href="https://open.feishu.cn/app"
            target="_blank"
            className="text-accent-primary hover:underline"
            rel="noreferrer"
          >
            Feishu Open Platform.
          </a>
        </p>
      ),
    },
  ];

  const onSubmit = async (formData: FeishuConfigFormValues) => {
    const payload: Partial<FeishuConfigFormValues> = { ...formData };

    try {
      const response = await updateInstanceConfigurations(payload);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Done!",
        message: "Your Feishu authentication is configured. You should test it now.",
      });
      reset({
        FEISHU_APP_ID: response.find((item) => item.key === "FEISHU_APP_ID")?.value,
        FEISHU_APP_SECRET: response.find((item) => item.key === "FEISHU_APP_SECRET")?.value,
        ENABLE_FEISHU_SYNC: response.find((item) => item.key === "ENABLE_FEISHU_SYNC")?.value,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleGoBack = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (isDirty) {
      e.preventDefault();
      setIsDiscardChangesModalOpen(true);
    }
  };

  return (
    <>
      <ConfirmDiscardModal
        isOpen={isDiscardChangesModalOpen}
        onDiscardHref="/authentication"
        handleClose={() => setIsDiscardChangesModalOpen(false)}
      />
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-2 gap-x-12 gap-y-8 w-full">
          <div className="flex flex-col gap-y-4 col-span-2 md:col-span-1 pt-1">
            <div className="pt-2.5 text-18 font-medium">Feishu-provided details for Plane</div>
            {FEISHU_FORM_FIELDS.map((field) => (
              <ControllerInput
                key={field.key}
                control={control}
                type={field.type}
                name={field.key}
                label={field.label}
                description={field.description}
                placeholder={field.placeholder}
                error={field.error}
                required={field.required}
              />
            ))}
            <ControllerSwitch control={control} field={FEISHU_FORM_SWITCH_FIELD} />
            <div className="flex flex-col gap-1 pt-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={(e) => void handleSubmit(onSubmit)(e)}
                  loading={isSubmitting}
                  disabled={!isDirty}
                >
                  {isSubmitting ? "Saving" : "Save changes"}
                </Button>
                <Link href="/authentication" className={getButtonStyling("secondary", "lg")} onClick={handleGoBack}>
                  Go back
                </Link>
              </div>
            </div>
          </div>
          <div className="col-span-2 md:col-span-1 flex flex-col gap-y-6">
            <div className="pt-2 text-18 font-medium">Plane-provided details for Feishu</div>

            <div className="flex flex-col gap-y-4">
              {/* web service details */}
              <div className="flex flex-col rounded-lg overflow-hidden">
                <div className="px-6 py-3 bg-layer-3 font-medium text-11 uppercase flex items-center gap-x-3 text-secondary">
                  <Monitor className="w-3 h-3" />
                  Web
                </div>
                <div className="px-6 py-4 flex flex-col gap-y-4 bg-layer-1">
                  {FEISHU_SERVICE_DETAILS.map((field) => (
                    <CopyField key={field.key} label={field.label} url={field.url} description={field.description} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

