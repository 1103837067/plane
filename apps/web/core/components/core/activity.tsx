import { useEffect } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { useTranslation } from "@plane/i18n";
// store hooks
// icons
import {
  TagIcon,
  CopyPlus,
  Calendar,
  Link2Icon,
  Users2Icon,
  ArchiveIcon,
  PaperclipIcon,
  TriangleIcon,
  LayoutGridIcon,
  SignalMediumIcon,
  MessageSquareIcon,
  UsersIcon,
} from "lucide-react";
import {
  BlockedIcon,
  BlockerIcon,
  CycleIcon,
  EpicIcon,
  IntakeIcon,
  ModuleIcon,
  RelatedIcon,
  WorkItemsIcon,
} from "@plane/propel/icons";
import { Tooltip } from "@plane/propel/tooltip";
import type { IIssueActivity } from "@plane/types";
import { renderFormattedDate, generateWorkItemLink, capitalizeFirstLetter } from "@plane/utils";
// helpers
import { useLabel } from "@/hooks/store/use-label";
import { usePlatformOS } from "@/hooks/use-platform-os";
// types

export function IssueLink({ activity }: { activity: IIssueActivity }) {
  // router params
  const { workspaceSlug } = useParams();
  const { isMobile } = usePlatformOS();
  const { t } = useTranslation();

  const workItemLink = generateWorkItemLink({
    workspaceSlug: workspaceSlug?.toString() ?? activity.workspace_detail?.slug,
    projectId: activity?.project,
    issueId: activity?.issue,
    projectIdentifier: activity?.project_detail?.identifier,
    sequenceId: activity?.issue_detail?.sequence_id,
  });

  return (
    <Tooltip
      tooltipContent={activity?.issue_detail ? activity.issue_detail.name : t("profile.activity_messages.deleted")}
      isMobile={isMobile}
    >
      {activity?.issue_detail ? (
        <a
          aria-disabled={activity.issue === null}
          href={workItemLink}
          target={activity.issue === null ? "_self" : "_blank"}
          rel={activity.issue === null ? "" : "noopener noreferrer"}
          className="inline items-center gap-1 font-medium text-primary hover:underline"
        >
          <span className="whitespace-nowrap">{`${activity.project_detail.identifier}-${activity.issue_detail.sequence_id}`}</span>{" "}
          <span className="font-regular break-all">{activity.issue_detail?.name}</span>
        </a>
      ) : (
        <span className="inline-flex items-center gap-1 font-medium text-primary whitespace-nowrap">
          {" "}
          {t("profile.activity_messages.a_work_item")}{" "}
        </span>
      )}
    </Tooltip>
  );
}

function UserLink({ activity }: { activity: IIssueActivity }) {
  // router params
  const { workspaceSlug } = useParams();

  return (
    <a
      href={`/${workspaceSlug ?? activity.workspace_detail?.slug}/profile/${
        activity.new_identifier ?? activity.old_identifier
      }`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center font-medium text-primary hover:underline"
    >
      {activity.new_value && activity.new_value !== "" ? activity.new_value : activity.old_value}
    </a>
  );
}

const LabelPill = observer(function LabelPill({ labelId, workspaceSlug }: { labelId: string; workspaceSlug: string }) {
  // store hooks
  const { workspaceLabels, fetchWorkspaceLabels } = useLabel();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    if (!workspaceLabels) fetchWorkspaceLabels(workspaceSlug);
  }, [fetchWorkspaceLabels, workspaceLabels, workspaceSlug]);

  return (
    <span
      className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
      style={{
        backgroundColor: workspaceLabels?.find((l) => l.id === labelId)?.color ?? "#000000",
      }}
      aria-hidden="true"
    />
  );
});

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
const getInboxUserActivityMessage = (activity: IIssueActivity, showIssue: boolean, t: any) => {
  const inboxActivityMessage = {
    declined: {
      showIssue: t("profile.activity_messages.declined_work_item"),
      noIssue: t("profile.activity_messages.declined_this_work_item_from_intake"),
    },
    snoozed: {
      showIssue: t("profile.activity_messages.snoozed_work_item"),
      noIssue: t("profile.activity_messages.snoozed_this_work_item"),
    },
    accepted: {
      showIssue: t("profile.activity_messages.accepted_work_item"),
      noIssue: t("profile.activity_messages.accepted_this_work_item_from_intake"),
    },
    markedDuplicate: {
      showIssue: t("profile.activity_messages.declined_work_item"),
      noIssue: t("profile.activity_messages.declined_this_work_item_from_intake"),
    },
  };

  switch (activity.verb) {
    case "-1":
      return showIssue ? inboxActivityMessage.declined.showIssue : inboxActivityMessage.declined.noIssue;
    case "0":
      return showIssue ? inboxActivityMessage.snoozed.showIssue : inboxActivityMessage.snoozed.noIssue;
    case "1":
      return showIssue ? inboxActivityMessage.accepted.showIssue : inboxActivityMessage.accepted.noIssue;
    case "2":
      return showIssue ? inboxActivityMessage.markedDuplicate.showIssue : inboxActivityMessage.markedDuplicate.noIssue;
    default:
      return t("profile.activity_messages.updated_intake_work_item_status");
  }
};
/* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */

const activityDetails: {
  [key: string]: {
    message: (
      activity: IIssueActivity,
      showIssue: boolean,
      workspaceSlug: string,
      t: (key: string) => string
    ) => React.ReactNode;
    icon: React.ReactNode;
  };
} = {
  assignees: {
    message: (activity, showIssue, _workspaceSlug, t) => {
      if (activity.old_value === "")
        return (
          <>
            {t("profile.activity_messages.added_new_assignee")} <UserLink activity={activity} />
            {showIssue && (
              <>
                {" "}
                {t("profile.activity_messages.prepositions.to")} <IssueLink activity={activity} />
              </>
            )}
          </>
        );
      else
        return (
          <>
            {t("profile.activity_messages.removed_assignee")} <UserLink activity={activity} />
            {showIssue && (
              <>
                {" "}
                {t("profile.activity_messages.prepositions.from")} <IssueLink activity={activity} />
              </>
            )}
          </>
        );
    },
    icon: <Users2Icon size={12} className="text-secondary" aria-hidden="true" />,
  },
  archived_at: {
    message: (activity, _showIssue, _workspaceSlug, t) => {
      if (activity.new_value === "restore")
        return (
          <>
            {t("profile.activity_messages.restored")} <IssueLink activity={activity} />
          </>
        );
      else
        return (
          <>
            {t("profile.activity_messages.archived")} <IssueLink activity={activity} />
          </>
        );
    },
    icon: <ArchiveIcon size={12} className="text-secondary" aria-hidden="true" />,
  },
  attachment: {
    message: (activity, showIssue, _workspaceSlug, t) => {
      if (activity.verb === "created")
        return (
          <>
            {t("profile.activity_messages.uploaded_a_new_attachment")}
            {showIssue && (
              <>
                {" "}
                {t("profile.activity_messages.prepositions.to")} <IssueLink activity={activity} />
              </>
            )}
          </>
        );
      else
        return (
          <>
            {t("profile.activity_messages.removed_an_attachment")}
            {showIssue && (
              <>
                {" "}
                {t("profile.activity_messages.prepositions.from")} <IssueLink activity={activity} />
              </>
            )}
          </>
        );
    },
    icon: <PaperclipIcon size={12} className="text-secondary" aria-hidden="true" />,
  },
  description: {
    message: (activity, showIssue, _workspaceSlug, t) => {
      return (
        <>
          {t("profile.activity_messages.updated_the_description")}
          {showIssue && (
            <>
              {" "}
              {t("profile.activity_messages.prepositions.of")} <IssueLink activity={activity} />
            </>
          )}
        </>
      );
    },
    icon: <MessageSquareIcon size={12} className="text-secondary" aria-hidden="true" />,
  },
  estimate_point: {
    message: (activity, showIssue, _workspaceSlug, t) => {
      if (!activity.new_value)
        return (
          <>
            {t("profile.activity_messages.removed_the_estimate_point")}
            {showIssue && (
              <>
                {" "}
                {t("profile.activity_messages.prepositions.from")} <IssueLink activity={activity} />
              </>
            )}
          </>
        );
      else
        return (
          <>
            {t("profile.activity_messages.set_the_estimate_point_to")} {activity.new_value}
            {showIssue && (
              <>
                {" "}
                {t("profile.activity_messages.prepositions.for")} <IssueLink activity={activity} />
              </>
            )}
          </>
        );
    },
    icon: <TriangleIcon size={12} className="text-secondary" aria-hidden="true" />,
  },
  issue: {
    message: (activity, _showIssue, _workspaceSlug, t) => {
      if (activity.verb === "created")
        return (
          <>
            {t("profile.activity_messages.created")} <IssueLink activity={activity} />
          </>
        );
      else if (activity.verb === "converted")
        return (
          <>
            {t("profile.activity_messages.converted_to_epic")} <IssueLink activity={activity} />
          </>
        );
      else
        return (
          <>
            {t("profile.activity_messages.deleted")} <IssueLink activity={activity} />
          </>
        );
    },
    icon: <WorkItemsIcon width={12} height={12} className="text-secondary" aria-hidden="true" />,
  },
  epic: {
    message: (activity, _showIssue, _workspaceSlug, t) => {
      if (activity.verb === "created")
        return (
          <>
            {t("profile.activity_messages.created")} <IssueLink activity={activity} />
          </>
        );
      else if (activity.verb === "converted")
        return (
          <>
            {t("profile.activity_messages.converted_to_work_item")} <IssueLink activity={activity} />
          </>
        );
      else
        return (
          <>
            {t("profile.activity_messages.deleted")} <IssueLink activity={activity} />
          </>
        );
    },
    icon: <EpicIcon width={12} height={12} className="text-secondary" aria-hidden="true" />,
  },
  labels: {
    message: (activity, showIssue, workspaceSlug, t) => {
      if (activity.old_value === "")
        return (
          <span className="overflow-hidden">
            {t("profile.activity_messages.added_new_label")}{" "}
            <span className="inline-flex items-center gap-2 rounded-full border border-strong px-2 py-0.5 text-11">
              <LabelPill labelId={activity.new_identifier ?? ""} workspaceSlug={workspaceSlug} />
              <span className="flex-shrink font-medium text-primary break-all line-clamp-1">{activity.new_value}</span>
            </span>
            {showIssue && (
              <span className="">
                {" "}
                {t("profile.activity_messages.prepositions.to")} <IssueLink activity={activity} />
              </span>
            )}
          </span>
        );
      else
        return (
          <>
            {t("profile.activity_messages.removed_label")}{" "}
            <span className="inline-flex items-center gap-2 rounded-full border border-strong px-2 py-0.5 text-11">
              <LabelPill labelId={activity.old_identifier ?? ""} workspaceSlug={workspaceSlug} />
              <span className="flex-shrink font-medium text-primary break-all line-clamp-1">{activity.old_value}</span>
            </span>
            {showIssue && (
              <span>
                {" "}
                {t("profile.activity_messages.prepositions.from")} <IssueLink activity={activity} />
              </span>
            )}
          </>
        );
    },
    icon: <TagIcon size={12} className="text-secondary" aria-hidden="true" />,
  },
  link: {
    message: (activity, showIssue, _workspaceSlug, t) => {
      if (activity.verb === "created")
        return (
          <>
            {t("profile.activity_messages.added_this")}{" "}
            <a
              href={`${activity.new_value}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              {t("profile.activity_messages.prepositions.link")}
            </a>
            {showIssue && (
              <>
                {" "}
                {t("profile.activity_messages.prepositions.to")} <IssueLink activity={activity} />
              </>
            )}
          </>
        );
      else if (activity.verb === "updated")
        return (
          <>
            {t("profile.activity_messages.updated_the")}{" "}
            <a
              href={`${activity.old_value}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              {t("profile.activity_messages.prepositions.link")}
            </a>
            {showIssue && (
              <>
                {" "}
                {t("profile.activity_messages.prepositions.from")} <IssueLink activity={activity} />
              </>
            )}
          </>
        );
      else
        return (
          <>
            {t("profile.activity_messages.removed_this")}{" "}
            <a
              href={`${activity.old_value}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              {t("profile.activity_messages.prepositions.link")}
            </a>
            {showIssue && (
              <>
                {" "}
                {t("profile.activity_messages.prepositions.from")} <IssueLink activity={activity} />
              </>
            )}
          </>
        );
    },
    icon: <Link2Icon size={12} className="text-secondary" aria-hidden="true" />,
  },
  cycles: {
    message: (activity, showIssue, workspaceSlug, t) => {
      if (activity.verb === "created")
        return (
          <>
            <span className="flex-shrink-0">
              {t("profile.activity_messages.added")}{" "}
              {showIssue ? <IssueLink activity={activity} /> : t("profile.activity_messages.this_work_item")}{" "}
              <span className="whitespace-nowrap">{t("profile.activity_messages.to_the_cycle")}</span>{" "}
            </span>
            <a
              href={`/${workspaceSlug}/projects/${activity.project}/cycles/${activity.new_identifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline items-center gap-1 font-medium text-primary hover:underline"
            >
              <span className="break-all">{activity.new_value}</span>
            </a>
          </>
        );
      else if (activity.verb === "updated")
        return (
          <>
            <span className="flex-shrink-0 whitespace-nowrap">{t("profile.activity_messages.set_the_cycle_to")} </span>
            <a
              href={`/${workspaceSlug}/projects/${activity.project}/cycles/${activity.new_identifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline items-center gap-1 font-medium text-primary hover:underline"
            >
              <span className="break-all">{activity.new_value}</span>
            </a>
          </>
        );
      else
        return (
          <>
            {t("profile.activity_messages.removed")} <IssueLink activity={activity} />{" "}
            {t("profile.activity_messages.from_the_cycle")}{" "}
            <a
              href={`/${workspaceSlug}/projects/${activity.project}/cycles/${activity.old_identifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline items-center gap-1 font-medium text-primary hover:underline"
            >
              <span className="break-all">{activity.old_value}</span>
            </a>
          </>
        );
    },
    icon: <CycleIcon height={12} width={12} className="text-secondary" aria-hidden="true" />,
  },
  modules: {
    message: (activity, showIssue, workspaceSlug, t) => {
      if (activity.verb === "created")
        return (
          <>
            {t("profile.activity_messages.added")}{" "}
            {showIssue ? <IssueLink activity={activity} /> : t("profile.activity_messages.this_work_item")}{" "}
            {t("profile.activity_messages.to_the_module")}{" "}
            <a
              href={`/${workspaceSlug}/projects/${activity.project}/modules/${activity.new_identifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline items-center gap-1 font-medium text-primary hover:underline"
            >
              <span className="break-all">{activity.new_value}</span>
            </a>
          </>
        );
      else if (activity.verb === "updated")
        return (
          <>
            {t("profile.activity_messages.set_the_module_to")}{" "}
            <a
              href={`/${workspaceSlug}/projects/${activity.project}/modules/${activity.new_identifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline items-center gap-1 font-medium text-primary hover:underline"
            >
              <span className="break-all">{activity.new_value}</span>
            </a>
          </>
        );
      else
        return (
          <>
            {t("profile.activity_messages.removed")} <IssueLink activity={activity} />{" "}
            {t("profile.activity_messages.from_the_module")}{" "}
            <a
              href={`/${workspaceSlug}/projects/${activity.project}/modules/${activity.old_identifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline items-center gap-1 font-medium text-primary hover:underline"
            >
              <span className="break-all">{activity.old_value}</span>
            </a>
          </>
        );
    },
    icon: <ModuleIcon className="h-3 w-3 !text-secondary" aria-hidden="true" />,
  },
  name: {
    message: (activity, showIssue, _workspaceSlug, t) => {
      return (
        <>
          {t("profile.activity_messages.set_the_title_to")} <span className="break-all">{activity.new_value}</span>
          {showIssue && (
            <>
              {" "}
              {t("profile.activity_messages.prepositions.of")} <IssueLink activity={activity} />
            </>
          )}
        </>
      );
    },
    icon: <MessageSquareIcon size={12} className="text-secondary" aria-hidden="true" />,
  },
  parent: {
    message: (activity, showIssue, _workspaceSlug, t) => {
      if (!activity.new_value)
        return (
          <>
            {t("profile.activity_messages.removed_parent")}{" "}
            <span className="font-medium text-primary whitespace-nowrap">{activity.old_value}</span>
            {showIssue && (
              <>
                {" "}
                {t("profile.activity_messages.prepositions.from")} <IssueLink activity={activity} />
              </>
            )}
          </>
        );
      else
        return (
          <>
            {t("profile.activity_messages.set_parent_to")}{" "}
            <span className="font-medium text-primary whitespace-nowrap">{activity.new_value}</span>
            {showIssue && (
              <>
                {" "}
                {t("profile.activity_messages.prepositions.for")} <IssueLink activity={activity} />
              </>
            )}
          </>
        );
    },
    icon: <UsersIcon className="h-3 w-3 !text-secondary" aria-hidden="true" />,
  },
  priority: {
    message: (activity, showIssue, _workspaceSlug, t) => {
      return (
        <>
          {t("profile.activity_messages.set_priority_to")}{" "}
          <span className="font-medium text-primary">
            {activity.new_value ? capitalizeFirstLetter(activity.new_value) : t("profile.activity_messages.none")}
          </span>
          {showIssue && (
            <>
              {" "}
              {t("profile.activity_messages.prepositions.for")} <IssueLink activity={activity} />
            </>
          )}
        </>
      );
    },
    icon: <SignalMediumIcon size={12} className="text-secondary" aria-hidden="true" />,
  },
  relates_to: {
    message: (activity, showIssue, _workspaceSlug, t) => {
      if (activity.old_value === "")
        return (
          <>
            {t("profile.activity_messages.marked_that")}{" "}
            {showIssue ? <IssueLink activity={activity} /> : t("profile.activity_messages.this_work_item")}{" "}
            {t("profile.activity_messages.relates_to")}{" "}
            <span className="font-medium text-primary whitespace-nowrap">{activity.new_value}</span>.
          </>
        );
      else
        return (
          <>
            {t("profile.activity_messages.removed_the_relation_from")}{" "}
            <span className="font-medium text-primary whitespace-nowrap">{activity.old_value}</span>.
          </>
        );
    },
    icon: <RelatedIcon height="12" width="12" className="text-secondary" />,
  },
  blocking: {
    message: (activity, showIssue, _workspaceSlug, t) => {
      if (activity.old_value === "")
        return (
          <>
            {t("profile.activity_messages.marked_that")}{" "}
            {showIssue ? <IssueLink activity={activity} /> : t("profile.activity_messages.this_work_item")}{" "}
            {t("profile.activity_messages.is_blocking_work_item")}{" "}
            <span className="font-medium text-primary whitespace-nowrap">{activity.new_value}</span>.
          </>
        );
      else
        return (
          <>
            {t("profile.activity_messages.removed_the_blocking_work_item")}{" "}
            <span className="font-medium text-primary whitespace-nowrap">{activity.old_value}</span>.
          </>
        );
    },
    icon: <BlockerIcon height="12" width="12" className="text-secondary" />,
  },
  blocked_by: {
    message: (activity, showIssue, _workspaceSlug, t) => {
      if (activity.old_value === "")
        return (
          <>
            {t("profile.activity_messages.marked_that")}{" "}
            {showIssue ? <IssueLink activity={activity} /> : t("profile.activity_messages.this_work_item")}{" "}
            {t("profile.activity_messages.is_being_blocked_by")}{" "}
            <span className="font-medium text-primary whitespace-nowrap">{activity.new_value}</span>.
          </>
        );
      else
        return (
          <>
            {t("profile.activity_messages.removed")}{" "}
            {showIssue ? <IssueLink activity={activity} /> : t("profile.activity_messages.this_work_item")}{" "}
            {t("profile.activity_messages.removed_being_blocked_by_work_item")}{" "}
            <span className="font-medium text-primary whitespace-nowrap">{activity.old_value}</span>.
          </>
        );
    },
    icon: <BlockedIcon height="12" width="12" className="text-secondary" />,
  },
  duplicate: {
    message: (activity, showIssue, _workspaceSlug, t) => {
      if (activity.old_value === "")
        return (
          <>
            {t("profile.activity_messages.marked_that")}{" "}
            {showIssue ? <IssueLink activity={activity} /> : t("profile.activity_messages.this_work_item")}{" "}
            {t("profile.activity_messages.as_duplicate_of")}{" "}
            <span className="font-medium text-primary whitespace-nowrap">{activity.new_value}</span>.
          </>
        );
      else
        return (
          <>
            {t("profile.activity_messages.removed")}{" "}
            {showIssue ? <IssueLink activity={activity} /> : t("profile.activity_messages.this_work_item")}{" "}
            {t("profile.activity_messages.removed_as_a_duplicate_of")}{" "}
            <span className="font-medium text-primary whitespace-nowrap">{activity.old_value}</span>.
          </>
        );
    },
    icon: <CopyPlus size={12} className="text-secondary" />,
  },
  state: {
    message: (activity, showIssue, _workspaceSlug, t) => {
      return (
        <>
          {t("profile.activity_messages.set_state_to")}{" "}
          <span className="font-medium text-primary break-all">{activity.new_value}</span>
          {showIssue && (
            <>
              {" "}
              {t("profile.activity_messages.prepositions.for")} <IssueLink activity={activity} />
            </>
          )}
        </>
      );
    },
    icon: <LayoutGridIcon size={12} className="text-secondary" aria-hidden="true" />,
  },
  start_date: {
    message: (activity, showIssue, _workspaceSlug, t) => {
      if (!activity.new_value)
        return (
          <>
            {t("profile.activity_messages.removed_the_start_date")}
            {showIssue && (
              <>
                {" "}
                {t("profile.activity_messages.prepositions.from")} <IssueLink activity={activity} />
              </>
            )}
          </>
        );
      else
        return (
          <>
            {t("profile.activity_messages.set_the_start_date_to")}{" "}
            <span className="font-medium text-primary whitespace-nowrap">
              {renderFormattedDate(activity.new_value)}
            </span>
            {showIssue && (
              <>
                {" "}
                {t("profile.activity_messages.prepositions.for")} <IssueLink activity={activity} />
              </>
            )}
          </>
        );
    },
    icon: <Calendar size={12} className="text-secondary" aria-hidden="true" />,
  },
  target_date: {
    message: (activity, showIssue, _workspaceSlug, t) => {
      if (!activity.new_value)
        return (
          <>
            {t("profile.activity_messages.removed_the_due_date")}
            {showIssue && (
              <>
                {" "}
                {t("profile.activity_messages.prepositions.from")} <IssueLink activity={activity} />
              </>
            )}
          </>
        );
      else
        return (
          <>
            {t("profile.activity_messages.set_the_due_date_to")}{" "}
            <span className="font-medium text-primary whitespace-nowrap">
              {renderFormattedDate(activity.new_value)}
            </span>
            {showIssue && (
              <>
                {" "}
                {t("profile.activity_messages.prepositions.for")} <IssueLink activity={activity} />
              </>
            )}
          </>
        );
    },
    icon: <Calendar size={12} className="text-secondary" aria-hidden="true" />,
  },
  inbox: {
    message: (activity, showIssue, _workspaceSlug, t) => {
      return (
        <>
          {getInboxUserActivityMessage(activity, showIssue, t)}
          {showIssue && (
            <>
              {" "}
              <IssueLink activity={activity} />
            </>
          )}
          {activity.verb === "2" && ` ${t("profile.activity_messages.from_intake_by_marking_a_duplicate_work_item")}.`}
        </>
      );
    },
    icon: <IntakeIcon className="size-3 text-secondary" aria-hidden="true" />,
  },
};

export function ActivityIcon({ activity }: { activity: IIssueActivity }) {
  return <>{activityDetails[activity.field as keyof typeof activityDetails]?.icon}</>;
}

type ActivityMessageProps = {
  activity: IIssueActivity;
  showIssue?: boolean;
};

export function ActivityMessage({ activity, showIssue = false }: ActivityMessageProps) {
  // router params
  const { workspaceSlug } = useParams();
  const { t } = useTranslation();
  const activityField = activity.field ?? "issue";

  return (
    <>
      {activityDetails[activityField as keyof typeof activityDetails]?.message(
        activity,
        showIssue,
        workspaceSlug ? workspaceSlug.toString() : (activity.workspace_detail?.slug ?? ""),
        t
      )}
    </>
  );
}
