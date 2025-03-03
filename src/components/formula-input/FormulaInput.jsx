import { useEditor, EditorContent, ReactRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import { useEffect } from "react";
import tippy from "tippy.js";
import "./formulaInput.css";
import Suggestions from "../suggestions/Suggestions";
import { useQueryClient } from "@tanstack/react-query";
import useStore from "../../store";
import { fetchSuggestions } from "../../api";

const CustomMention = Mention.extend({
  addAttributes() {
    return {
      id: { default: null },
      label: { default: null },
      data: {
        default: null,
        renderHTML: (attributes) => ({
          "data-data": JSON.stringify(attributes.data),
        }),
      },
    };
  },
  addKeyboardShortcuts() {
    return { Enter: () => true };
  },
  renderHTML({ node }) {
    return [
      "span",
      { class: "mention", "data-id": node.attrs.id },
      node.attrs.label,
    ];
  },
});

const FormulaInput = () => {
  const queryClient = useQueryClient();
  const { formulaResult, updateFormula } = useStore();

  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomMention.configure({
        HTMLAttributes: { class: "mention" },
        suggestion: {
          char: "@",
          items: async ({ query }) => {
            try {
              return await queryClient.fetchQuery({
                queryKey: ["suggestions", query],
                queryFn: () => fetchSuggestions(query),
                staleTime: 5 * 60 * 1000,
              });
            } catch (error) {
              console.error("Error fetching suggestions:", error);
              return [];
            }
          },
          render: () => {
            let component;
            let popup;

            return {
              onStart: (props) => {
                component = new ReactRenderer(Suggestions, {
                  props,
                  editor: props.editor,
                });
                popup = tippy("body", {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: "manual",
                  placement: "bottom-start",
                });
              },
              onUpdate: (props) => {
                component.updateProps(props);
                popup[0].setProps({ getReferenceClientRect: props.clientRect });
              },
              onKeyDown: (props) => {
                if (props.event.key === "Escape") {
                  popup[0].hide();
                  return true;
                }
                return component?.ref?.onKeyDown(props.event) || false;
              },
              onExit: () => {
                popup[0].destroy();
                component.destroy();
              },
            };
          },
        },
      }),
    ],
    content: "",
  });

  useEffect(() => {
    if (!editor) return;

    const timeout = setTimeout(() => {
      let formula = "";
      editor.state.doc.descendants((node) => {
        formula += node.isText ? node.text : node.attrs.data?.value || "0";
      });
      updateFormula(formula.trim());
    }, 300);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor?.state.doc.content, updateFormula]);

  useEffect(() => {
    if (!editor) return;

    const handleMentionClick = (event) => {
      const mention = event.target.closest(".mention");

      if (mention) {
        // Create a new popover and attach it outside the input
        tippy(mention, {
          content: `<div class="suggestions mention-menu">
                      <button class="mention-menu-item">View Details</button>
                      <button class="mention-menu-item">Edit</button>
                      <button class="mention-menu-item">Remove</button>
                    </div>`,
          allowHTML: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
          theme: "light-border",
          appendTo: () => document.body, // Ensure it renders as a separate popover
          onClickOutside: (instance) => {
            instance.hide();
          },
        }).show();
      }
    };

    document.addEventListener("click", handleMentionClick);

    return () => {
      document.removeEventListener("click", handleMentionClick);
    };
  }, [editor]);

  return (
    <div className="editor-container">
      <EditorContent editor={editor} className="tiptap" />
      {formulaResult && (
        <div
          className={`result ${formulaResult === "Invalid" ? "invalid" : ""}`}
        >
          {formulaResult}
        </div>
      )}
    </div>
  );
};

export default FormulaInput;
