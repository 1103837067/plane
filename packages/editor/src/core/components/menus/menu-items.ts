import type { Editor } from "@tiptap/react";
import {
  BoldIcon,
  Heading1,
  CheckSquare,
  Heading2,
  Heading3,
  TextQuote,
  ImageIcon,
  TableIcon,
  ListIcon,
  ListOrderedIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  CodeIcon,
  Heading4,
  Heading5,
  Heading6,
  CaseSensitive,
  MinusSquare,
  Palette,
  AlignCenter,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LinkIcon } from "@plane/propel/icons";
// constants
import { CORE_EXTENSIONS } from "@/constants/extension";
// helpers
import {
  insertHorizontalRule,
  insertImage,
  insertTableCommand,
  setLinkEditor,
  setText,
  setTextAlign,
  toggleBackgroundColor,
  toggleBlockquote,
  toggleBold,
  toggleBulletList,
  toggleCodeBlock,
  toggleHeading,
  toggleItalic,
  toggleOrderedList,
  toggleStrike,
  toggleTaskList,
  toggleTextColor,
  toggleUnderline,
  unsetLinkEditor,
} from "@/helpers/editor-commands";
// types
import type { TCommandWithProps, TEditorCommands } from "@/types";
import type { ISvgIcons } from "@plane/propel/icons";
type isActiveFunction<T extends TEditorCommands> = (params?: TCommandWithProps<T>) => boolean;
type commandFunction<T extends TEditorCommands> = (params?: TCommandWithProps<T>) => void;

export type EditorMenuItem<T extends TEditorCommands> = {
  key: T;
  name: string;
  command: commandFunction<T>;
  icon: LucideIcon | React.FC<ISvgIcons>;
  isActive: isActiveFunction<T>;
};

type TranslationFunction = (key: string) => string;

export const TextItem = (editor: Editor, t: TranslationFunction): EditorMenuItem<"text"> => ({
  key: "text",
  name: t("editor.menu_items.text"),
  isActive: () => editor.isActive(CORE_EXTENSIONS.PARAGRAPH),
  command: () => setText(editor),
  icon: CaseSensitive,
});

type SupportedHeadingLevels = Extract<TEditorCommands, "h1" | "h2" | "h3" | "h4" | "h5" | "h6">;

const HeadingItem = <T extends SupportedHeadingLevels>(
  editor: Editor,
  level: 1 | 2 | 3 | 4 | 5 | 6,
  key: T,
  name: string,
  icon: LucideIcon
): EditorMenuItem<T> => ({
  key,
  name,
  isActive: () => editor.isActive(CORE_EXTENSIONS.HEADING, { level }),
  command: () => toggleHeading(editor, level),
  icon,
});

export const HeadingOneItem = (editor: Editor, t: TranslationFunction): EditorMenuItem<"h1"> =>
  HeadingItem(editor, 1, "h1", t("editor.menu_items.h1"), Heading1);

export const HeadingTwoItem = (editor: Editor, t: TranslationFunction): EditorMenuItem<"h2"> =>
  HeadingItem(editor, 2, "h2", t("editor.menu_items.h2"), Heading2);

export const HeadingThreeItem = (editor: Editor, t: TranslationFunction): EditorMenuItem<"h3"> =>
  HeadingItem(editor, 3, "h3", t("editor.menu_items.h3"), Heading3);

export const HeadingFourItem = (editor: Editor, t: TranslationFunction): EditorMenuItem<"h4"> =>
  HeadingItem(editor, 4, "h4", t("editor.menu_items.h4"), Heading4);

export const HeadingFiveItem = (editor: Editor, t: TranslationFunction): EditorMenuItem<"h5"> =>
  HeadingItem(editor, 5, "h5", t("editor.menu_items.h5"), Heading5);

export const HeadingSixItem = (editor: Editor, t: TranslationFunction): EditorMenuItem<"h6"> =>
  HeadingItem(editor, 6, "h6", t("editor.menu_items.h6"), Heading6);

export const BoldItem = (editor: Editor, t: TranslationFunction): EditorMenuItem<"bold"> => ({
  key: "bold",
  name: t("editor.menu_items.bold"),
  isActive: () => editor?.isActive(CORE_EXTENSIONS.BOLD),
  command: () => toggleBold(editor),
  icon: BoldIcon,
});

export const ItalicItem = (editor: Editor, t: TranslationFunction): EditorMenuItem<"italic"> => ({
  key: "italic",
  name: t("editor.menu_items.italic"),
  isActive: () => editor?.isActive(CORE_EXTENSIONS.ITALIC),
  command: () => toggleItalic(editor),
  icon: ItalicIcon,
});

export const UnderLineItem = (editor: Editor, t: TranslationFunction): EditorMenuItem<"underline"> => ({
  key: "underline",
  name: t("editor.menu_items.underline"),
  isActive: () => editor?.isActive(CORE_EXTENSIONS.UNDERLINE),
  command: () => toggleUnderline(editor),
  icon: UnderlineIcon,
});

export const StrikeThroughItem = (editor: Editor, t: TranslationFunction): EditorMenuItem<"strikethrough"> => ({
  key: "strikethrough",
  name: t("editor.menu_items.strikethrough"),
  isActive: () => editor?.isActive(CORE_EXTENSIONS.STRIKETHROUGH),
  command: () => toggleStrike(editor),
  icon: StrikethroughIcon,
});

export const BulletListItem = (editor: Editor, t: TranslationFunction): EditorMenuItem<"bulleted-list"> => ({
  key: "bulleted-list",
  name: t("editor.menu_items.bulleted_list"),
  isActive: () => editor?.isActive(CORE_EXTENSIONS.BULLET_LIST),
  command: () => toggleBulletList(editor),
  icon: ListIcon,
});

export const NumberedListItem = (editor: Editor, t: TranslationFunction): EditorMenuItem<"numbered-list"> => ({
  key: "numbered-list",
  name: t("editor.menu_items.numbered_list"),
  isActive: () => editor?.isActive(CORE_EXTENSIONS.ORDERED_LIST),
  command: () => toggleOrderedList(editor),
  icon: ListOrderedIcon,
});

export const TodoListItem = (editor: Editor, t: TranslationFunction): EditorMenuItem<"to-do-list"> => ({
  key: "to-do-list",
  name: t("editor.menu_items.to_do_list"),
  isActive: () => editor.isActive(CORE_EXTENSIONS.TASK_ITEM),
  command: () => toggleTaskList(editor),
  icon: CheckSquare,
});

export const QuoteItem = (editor: Editor, t: TranslationFunction): EditorMenuItem<"quote"> => ({
  key: "quote",
  name: t("editor.menu_items.quote"),
  isActive: () => editor?.isActive(CORE_EXTENSIONS.BLOCKQUOTE),
  command: () => toggleBlockquote(editor),
  icon: TextQuote,
});

export const CodeItem = (editor: Editor, t: TranslationFunction): EditorMenuItem<"code"> => ({
  key: "code",
  name: t("editor.menu_items.code"),
  isActive: () => editor?.isActive(CORE_EXTENSIONS.CODE_INLINE) || editor?.isActive(CORE_EXTENSIONS.CODE_BLOCK),
  command: () => toggleCodeBlock(editor),
  icon: CodeIcon,
});

export const TableItem = (editor: Editor, t: TranslationFunction): EditorMenuItem<"table"> => ({
  key: "table",
  name: t("editor.menu_items.table"),
  isActive: () => editor?.isActive(CORE_EXTENSIONS.TABLE),
  command: () => insertTableCommand(editor),
  icon: TableIcon,
});

export const ImageItem = (editor: Editor, t: TranslationFunction): EditorMenuItem<"image"> => ({
  key: "image",
  name: t("editor.menu_items.image"),
  isActive: () => editor?.isActive(CORE_EXTENSIONS.IMAGE) || editor?.isActive(CORE_EXTENSIONS.CUSTOM_IMAGE),
  command: () => insertImage({ editor, event: "insert", pos: editor.state.selection.from }),
  icon: ImageIcon,
});

export const HorizontalRuleItem = (editor: Editor, t: TranslationFunction): EditorMenuItem<"divider"> =>
  ({
    key: "divider",
    name: t("editor.menu_items.divider"),
    isActive: () => editor?.isActive(CORE_EXTENSIONS.HORIZONTAL_RULE),
    command: () => insertHorizontalRule(editor),
    icon: MinusSquare,
  }) as const;

export const LinkItem = (editor: Editor, t: TranslationFunction): EditorMenuItem<"link"> =>
  ({
    key: "link",
    name: t("editor.menu_items.link"),
    isActive: () => editor?.isActive("link"),

    command: (props) => {
      if (!props) return;
      if (props.url) setLinkEditor(editor, props.url, props.text);
      else unsetLinkEditor(editor);
    },

    icon: LinkIcon,
  }) as const;

export const TextColorItem = (editor: Editor, t: TranslationFunction): EditorMenuItem<"text-color"> => ({
  key: "text-color",
  name: t("editor.menu_items.text_color"),
  isActive: (props) => editor.isActive(CORE_EXTENSIONS.CUSTOM_COLOR, { color: props?.color }),
  command: (props) => {
    if (!props) return;
    toggleTextColor(props.color, editor);
  },
  icon: Palette,
});

export const BackgroundColorItem = (editor: Editor, t: TranslationFunction): EditorMenuItem<"background-color"> => ({
  key: "background-color",
  name: t("editor.menu_items.background_color"),
  isActive: (props) => editor.isActive(CORE_EXTENSIONS.CUSTOM_COLOR, { backgroundColor: props?.color }),
  command: (props) => {
    if (!props) return;
    toggleBackgroundColor(props.color, editor);
  },
  icon: Palette,
});

export const TextAlignItem = (editor: Editor, t: TranslationFunction): EditorMenuItem<"text-align"> => ({
  key: "text-align",
  name: t("editor.menu_items.text_align"),
  isActive: (props) => editor.isActive({ textAlign: props?.alignment }),
  command: (props) => {
    if (!props) return;
    setTextAlign(props.alignment, editor);
  },
  icon: AlignCenter,
});

export const getEditorMenuItems = (editor: Editor | null, t: TranslationFunction): EditorMenuItem<TEditorCommands>[] => {
  if (!editor) return [];

  return [
    TextItem(editor, t),
    HeadingOneItem(editor, t),
    HeadingTwoItem(editor, t),
    HeadingThreeItem(editor, t),
    HeadingFourItem(editor, t),
    HeadingFiveItem(editor, t),
    HeadingSixItem(editor, t),
    BoldItem(editor, t),
    ItalicItem(editor, t),
    UnderLineItem(editor, t),
    StrikeThroughItem(editor, t),
    BulletListItem(editor, t),
    TodoListItem(editor, t),
    CodeItem(editor, t),
    NumberedListItem(editor, t),
    QuoteItem(editor, t),
    TableItem(editor, t),
    ImageItem(editor, t),
    HorizontalRuleItem(editor, t),
    LinkItem(editor, t),
    TextColorItem(editor, t),
    BackgroundColorItem(editor, t),
    TextAlignItem(editor, t),
  ] as EditorMenuItem<TEditorCommands>[];
};
