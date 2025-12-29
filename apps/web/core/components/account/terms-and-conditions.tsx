import React from "react";
import Link from "next/link";
import { EAuthModes } from "@plane/constants";
import { useTranslation } from "@plane/i18n";

interface TermsAndConditionsProps {
  authType?: EAuthModes;
}

// Constants for better maintainability
const LEGAL_LINKS = {
  termsOfService: "https://plane.so/legals/terms-and-conditions",
  privacyPolicy: "https://plane.so/legals/privacy-policy",
} as const;

// Reusable link component to reduce duplication
function LegalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-secondary" target="_blank" rel="noopener noreferrer">
      <span className="text-13 font-medium underline hover:cursor-pointer">{children}</span>
    </Link>
  );
}

export function TermsAndConditions({ authType = EAuthModes.SIGN_IN }: TermsAndConditionsProps) {
  const { t } = useTranslation();
  
  const message = authType === EAuthModes.SIGN_UP 
    ? t("auth.terms_and_conditions.by_creating_account")
    : t("auth.terms_and_conditions.by_signing_in");

  return (
    <div className="flex items-center justify-center">
      <p className="text-center text-13 text-tertiary">
        {message} {t("auth.terms_and_conditions.our")}{" "}
        <LegalLink href={LEGAL_LINKS.termsOfService}>{t("auth.terms_and_conditions.terms_of_service")}</LegalLink>{" "}
        {t("auth.terms_and_conditions.and")}{" "}
        <LegalLink href={LEGAL_LINKS.privacyPolicy}>{t("auth.terms_and_conditions.privacy_policy")}</LegalLink>。
      </p>
    </div>
  );
}
