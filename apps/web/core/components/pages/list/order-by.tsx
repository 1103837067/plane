import { ArrowDownWideNarrow, ArrowUpWideNarrow, Check } from "lucide-react";
// plane imports
import { useTranslation } from "@plane/i18n";
import { getButtonStyling } from "@plane/propel/button";
import type { TPageFiltersSortBy, TPageFiltersSortKey } from "@plane/types";
import { CustomMenu } from "@plane/ui";

type Props = {
  onChange: (value: { key?: TPageFiltersSortKey; order?: TPageFiltersSortBy }) => void;
  sortBy: TPageFiltersSortBy;
  sortKey: TPageFiltersSortKey;
};

export function PageOrderByDropdown(props: Props) {
  const { onChange, sortBy, sortKey } = props;
  const { t } = useTranslation();

  const PAGE_SORTING_KEY_OPTIONS: {
    key: TPageFiltersSortKey;
    label: string;
  }[] = [
    { key: "name", label: t("project_page.sort.name") },
    { key: "created_at", label: t("project_page.sort.date_created") },
    { key: "updated_at", label: t("project_page.sort.date_modified") },
  ];

  const orderByDetails = PAGE_SORTING_KEY_OPTIONS.find((option) => sortKey === option.key);
  const isDescending = sortBy === "desc";

  return (
    <CustomMenu
      customButton={
        <div className={getButtonStyling("secondary", "lg")}>
          {!isDescending ? <ArrowUpWideNarrow className="size-3 " /> : <ArrowDownWideNarrow className="size-3 " />}
          {orderByDetails?.label}
        </div>
      }
      placement="bottom-end"
      maxHeight="lg"
      closeOnSelect
    >
      {PAGE_SORTING_KEY_OPTIONS.map((option) => (
        <CustomMenu.MenuItem
          key={option.key}
          className="flex items-center justify-between gap-2"
          onClick={() =>
            onChange({
              key: option.key,
            })
          }
        >
          {option.label}
          {sortKey === option.key && <Check className="h-3 w-3" />}
        </CustomMenu.MenuItem>
      ))}
      <hr className="my-2 border-subtle" />
      <CustomMenu.MenuItem
        className="flex items-center justify-between gap-2"
        onClick={() => {
          if (isDescending)
            onChange({
              order: "asc",
            });
        }}
      >
        {t("project_page.sort.ascending")}
        {!isDescending && <Check className="h-3 w-3" />}
      </CustomMenu.MenuItem>
      <CustomMenu.MenuItem
        className="flex items-center justify-between gap-2"
        onClick={() => {
          if (!isDescending)
            onChange({
              order: "desc",
            });
        }}
      >
        {t("project_page.sort.descending")}
        {isDescending && <Check className="h-3 w-3" />}
      </CustomMenu.MenuItem>
    </CustomMenu>
  );
}
