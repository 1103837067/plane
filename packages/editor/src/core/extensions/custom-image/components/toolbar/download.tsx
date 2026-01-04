import { Download } from "lucide-react";
import { useTranslation } from "@plane/i18n";
// plane imports
import { Tooltip } from "@plane/propel/tooltip";

type Props = {
  src: string;
};

export function ImageDownloadAction(props: Props) {
  const { src } = props;
  const { t } = useTranslation();

  return (
    <Tooltip tooltipContent={t("editor.image.download_image")}>
      <button
        type="button"
        onClick={() => window.open(src, "_blank")}
        className="flex-shrink-0 h-full grid place-items-center text-white/60 hover:text-white transition-colors"
        aria-label={t("editor.image.download_image")}
      >
        <Download className="size-3" />
      </button>
    </Tooltip>
  );
}
