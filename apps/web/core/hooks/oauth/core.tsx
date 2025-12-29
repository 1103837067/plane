// plane imports
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { API_BASE_URL } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import type { TOAuthConfigs, TOAuthOption } from "@plane/types";
// assets
import giteaLogo from "@/app/assets/logos/gitea-logo.svg?url";
import GithubLightLogo from "@/app/assets/logos/github-black.png?url";
import GithubDarkLogo from "@/app/assets/logos/github-dark.svg?url";
import gitlabLogo from "@/app/assets/logos/gitlab-logo.svg?url";
import googleLogo from "@/app/assets/logos/google-logo.svg?url";
import feishuLogo from "@/app/assets/logos/feishu-logo.svg?url";
// hooks
import { useInstance } from "@/hooks/store/use-instance";

export const useCoreOAuthConfig = (oauthActionText: string): TOAuthConfigs => {
  const { t } = useTranslation();
  //router
  const searchParams = useSearchParams();
  // query params
  const next_path = searchParams.get("next_path");
  // theme
  const { resolvedTheme } = useTheme();
  // store hooks
  const { config } = useInstance();
  // derived values
  const isOAuthEnabled =
    (config &&
      (config?.is_google_enabled ||
        config?.is_github_enabled ||
        config?.is_gitlab_enabled ||
        config?.is_gitea_enabled ||
        config?.is_feishu_enabled)) ||
    false;
  // Determine translation key based on action text
  const translationKey = oauthActionText === "Sign up" ? "auth.oauth.sign_up_with" : "auth.oauth.sign_in_with";

  const oAuthOptions: TOAuthOption[] = [
    {
      id: "google",
      text: t(translationKey, { provider: "Google" }),
      icon: <img src={googleLogo} height={18} width={18} alt="Google Logo" />,
      onClick: () => {
        window.location.assign(`${API_BASE_URL}/auth/google/${next_path ? `?next_path=${next_path}` : ``}`);
      },
      enabled: config?.is_google_enabled,
    },
    {
      id: "github",
      text: t(translationKey, { provider: "GitHub" }),
      icon: (
        <img
          src={resolvedTheme === "dark" ? GithubDarkLogo : GithubLightLogo}
          height={18}
          width={18}
          alt="GitHub Logo"
        />
      ),
      onClick: () => {
        window.location.assign(`${API_BASE_URL}/auth/github/${next_path ? `?next_path=${next_path}` : ``}`);
      },
      enabled: config?.is_github_enabled,
    },
    {
      id: "gitlab",
      text: t(translationKey, { provider: "GitLab" }),
      icon: <img src={gitlabLogo} height={18} width={18} alt="GitLab Logo" />,
      onClick: () => {
        window.location.assign(`${API_BASE_URL}/auth/gitlab/${next_path ? `?next_path=${next_path}` : ``}`);
      },
      enabled: config?.is_gitlab_enabled,
    },
    {
      id: "gitea",
      text: t(translationKey, { provider: "Gitea" }),
      icon: <img src={giteaLogo} height={18} width={18} alt="Gitea Logo" />,
      onClick: () => {
        window.location.assign(`${API_BASE_URL}/auth/gitea/${next_path ? `?next_path=${next_path}` : ``}`);
      },
      enabled: config?.is_gitea_enabled,
    },
    {
      id: "feishu",
      text: t(translationKey, { provider: "飞书" }),
      icon: <img src={feishuLogo} height={18} width={18} alt="Feishu Logo" />,
      onClick: () => {
        window.location.assign(`${API_BASE_URL}/auth/feishu/${next_path ? `?next_path=${next_path}` : ``}`);
      },
      enabled: config?.is_feishu_enabled,
    },
  ];

  return {
    isOAuthEnabled,
    oAuthOptions,
  };
};
