import type { FC } from "react";
import { observer } from "mobx-react";
import { Controller, useForm } from "react-hook-form";
import { Check } from "lucide-react";
// plane imports
import { ONBOARDING_TRACKER_ELEMENTS, USER_TRACKER_EVENTS, USE_CASES } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import type { TUserProfile } from "@plane/types";
import { EOnboardingSteps } from "@plane/types";
import { cn } from "@plane/utils";
// helpers
import { captureError, captureSuccess, captureView } from "@/helpers/event-tracker.helper";
// hooks
import { useUserProfile } from "@/hooks/store/user";
// local imports
import { CommonOnboardingHeader } from "../common";
import type { TProfileSetupFormValues } from "../profile/root";

type Props = {
  handleStepChange: (step: EOnboardingSteps, skipInvites?: boolean) => void;
};

const defaultValues = {
  use_case: [] as string[],
};

export const UseCaseSetupStep = observer(function UseCaseSetupStep({ handleStepChange }: Props) {
  // hooks
  const { t } = useTranslation();
  // store hooks
  const { data: profile, updateUserProfile } = useUserProfile();
  // form info
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<TProfileSetupFormValues>({
    defaultValues: {
      ...defaultValues,
      use_case: profile?.use_case ? profile.use_case.split(". ") : [],
    },
    mode: "onChange",
  });

  // handle submit
  const handleSubmitUserPersonalization = async (formData: TProfileSetupFormValues) => {
    const profileUpdatePayload: Partial<TUserProfile> = {
      use_case: formData.use_case && formData.use_case.length > 0 ? formData.use_case.join(". ") : undefined,
    };
    try {
      await Promise.all([
        updateUserProfile(profileUpdatePayload),
        // totalSteps > 2 && stepChange({ profile_complete: true }),
      ]);
      captureSuccess({
        eventName: USER_TRACKER_EVENTS.add_details,
        payload: {
          use_case: profileUpdatePayload.use_case,
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

  // on submit
  const onSubmit = async (formData: TProfileSetupFormValues) => {
    if (!profile) return;
    captureView({
      elementName: ONBOARDING_TRACKER_ELEMENTS.PROFILE_SETUP_FORM,
    });
    await handleSubmitUserPersonalization(formData).then(() => {
      handleStepChange(EOnboardingSteps.USE_CASE_SETUP);
    });
  };

  // handle skip
  const handleSkip = () => {
    handleStepChange(EOnboardingSteps.USE_CASE_SETUP);
  };

  // derived values
  const isButtonDisabled = !isSubmitting && isValid ? false : true;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
      {/* Header */}
      <CommonOnboardingHeader 
        title={t("auth.onboarding.use_case.title")} 
        description={t("auth.onboarding.use_case.description")} 
      />

      {/* Use Case Selection */}
      <div className="flex flex-col gap-3">
        <p className="text-body-sm-semibold text-placeholder">{t("auth.onboarding.use_case.select_one_or_more")}</p>

        <Controller
          control={control}
          name="use_case"
          rules={{
            required: t("auth.onboarding.use_case.required"),
            validate: (value) => (value && value.length > 0) || t("auth.onboarding.use_case.required"),
          }}
          render={({ field: { value, onChange } }) => (
            <div className="flex flex-col gap-3">
              {USE_CASES.map((useCase) => {
                const isSelected = value?.includes(useCase) || false;
                return (
                  <button
                    key={useCase}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const currentValue = value || [];
                      if (isSelected) {
                        // Remove from array
                        onChange(currentValue.filter((item) => item !== useCase));
                      } else {
                        // Add to array
                        onChange([...currentValue, useCase]);
                      }
                    }}
                    className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 flex items-center gap-2 ${
                      isSelected
                        ? "border-accent-strong bg-accent-subtle text-accent-primary"
                        : "border-subtle hover:border-strong text-tertiary"
                    }`}
                  >
                    <span
                      className={cn(`size-4 rounded-sm border-2 flex items-center justify-center`, {
                        "bg-accent-primary border-accent-strong": isSelected,
                        "border-strong": !isSelected,
                      })}
                    >
                      <Check
                        className={cn("w-3 h-3 text-on-color", {
                          "opacity-100": isSelected,
                          "opacity-0": !isSelected,
                        })}
                      />
                    </span>

                    <span className="text-body-sm-regular">{useCase}</span>
                  </button>
                );
              })}
            </div>
          )}
        />
        {errors.use_case && <span className="text-13 text-red-500">{errors.use_case.message}</span>}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button variant="primary" type="submit" className="w-full" size="xl" disabled={isButtonDisabled}>
          {t("auth.onboarding.continue")}
        </Button>
        <Button variant="ghost" onClick={handleSkip} className="w-full" size="xl">
          {t("auth.onboarding.skip")}
        </Button>
      </div>
    </form>
  );
});
