import type { FC } from "react";
import { observer } from "mobx-react";
import { Controller, useForm } from "react-hook-form";
import { Box, PenTool, Rocket, Monitor, RefreshCw, Bug } from "lucide-react";
// plane imports
import { ONBOARDING_TRACKER_ELEMENTS, USER_TRACKER_EVENTS } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { CheckIcon, ViewsIcon } from "@plane/propel/icons";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import type { TUserProfile } from "@plane/types";
import { EOnboardingSteps } from "@plane/types";
// helpers
import { captureError, captureSuccess, captureView } from "@/helpers/event-tracker.helper";
// hooks
import { useUserProfile } from "@/hooks/store/user";
// local components
import { CommonOnboardingHeader } from "../common";
import type { TProfileSetupFormValues } from "../profile/root";

type Props = {
  handleStepChange: (step: EOnboardingSteps, skipInvites?: boolean) => void;
};

const defaultValues = {
  role: "",
};

export const RoleSetupStep = observer(function RoleSetupStep({ handleStepChange }: Props) {
  // hooks
  const { t } = useTranslation();
  // store hooks
  const { data: profile, updateUserProfile } = useUserProfile();
  
  // Define roles with translation keys
  const ROLES = [
    { id: "product-manager", label: t("auth.onboarding.role.product_manager"), icon: Box },
    { id: "engineering-manager", label: t("auth.onboarding.role.engineering_manager"), icon: ViewsIcon },
    { id: "designer", label: t("auth.onboarding.role.designer"), icon: PenTool },
    { id: "developer", label: t("auth.onboarding.role.developer"), icon: Monitor },
    { id: "qa-engineer", label: t("auth.onboarding.role.qa_engineer"), icon: Bug },
    { id: "founder-executive", label: t("auth.onboarding.role.founder_executive"), icon: Rocket },
    { id: "operations-manager", label: t("auth.onboarding.role.operations_manager"), icon: RefreshCw },
    { id: "others", label: t("auth.onboarding.role.others"), icon: Box },
  ];
  // form info
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<TProfileSetupFormValues>({
    defaultValues: {
      ...defaultValues,
      role: profile?.role,
    },
    mode: "onChange",
  });

  // handle submit
  const handleSubmitUserPersonalization = async (formData: TProfileSetupFormValues) => {
    const profileUpdatePayload: Partial<TUserProfile> = {
      role: formData.role,
    };
    try {
      await Promise.all([
        updateUserProfile(profileUpdatePayload),
        // totalSteps > 2 && stepChange({ profile_complete: true }),
      ]);
      captureSuccess({
        eventName: USER_TRACKER_EVENTS.add_details,
        payload: {
          use_case: formData.use_case,
          role: formData.role,
        },
      });
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: t("common.success"),
        message: t("auth.onboarding.role.success"),
      });
    } catch {
      captureError({
        eventName: USER_TRACKER_EVENTS.add_details,
      });
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("common.error.label"),
        message: t("auth.onboarding.role.error"),
      });
    }
  };

  const onSubmit = async (formData: TProfileSetupFormValues) => {
    if (!profile) return;
    captureView({
      elementName: ONBOARDING_TRACKER_ELEMENTS.PROFILE_SETUP_FORM,
    });
    await handleSubmitUserPersonalization(formData).then(() => {
      handleStepChange(EOnboardingSteps.ROLE_SETUP);
    });
  };

  const handleSkip = () => {
    handleStepChange(EOnboardingSteps.ROLE_SETUP);
  };

  const isButtonDisabled = !isSubmitting && isValid ? false : true;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
      {/* Header */}
      <CommonOnboardingHeader 
        title={t("auth.onboarding.role.title")} 
        description={t("auth.onboarding.role.description")} 
      />
      {/* Role Selection */}
      <div className="flex flex-col gap-3">
        <p className="text-body-sm-semibold text-placeholder">{t("auth.onboarding.role.select_one")}</p>
        <Controller
          control={control}
          name="role"
          rules={{
            required: t("auth.onboarding.role.required"),
          }}
          render={({ field: { value, onChange } }) => (
            <div className="flex flex-col gap-3">
              {ROLES.map((role) => {
                const Icon = role.icon;
                const isSelected = value === role.id;

                return (
                  <button
                    key={role.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onChange(role.id);
                    }}
                    className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 flex items-center justify-between ${
                      isSelected
                        ? "border-accent-strong bg-accent-subtle text-accent-primary"
                        : "border-subtle hover:border-strong text-tertiary"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="size-3.5" />
                      <span className="text-body-sm-semibold">{role.label}</span>
                    </div>
                    {isSelected && (
                      <>
                        <button
                          className={`size-4 rounded-sm border-2 flex items-center justify-center bg-accent-primary border-blue-500`}
                        >
                          <CheckIcon className="w-3 h-3 text-on-color" />
                        </button>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        />
        {errors.role && <span className="text-13 text-danger-primary">{errors.role.message}</span>}
      </div>
      {/* Action Buttons */}
      <div className="space-y-3">
        <Button variant="primary" type="submit" className="w-full" size="xl" disabled={isButtonDisabled}>
          {t("auth.onboarding.continue")}
        </Button>
        <Button variant="ghost" onClick={handleSkip} className="text-tertiary w-full" size="xl">
          {t("auth.onboarding.skip")}
        </Button>
      </div>
    </form>
  );
});
