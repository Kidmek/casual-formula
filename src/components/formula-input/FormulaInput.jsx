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

  return (
    <div className="editor-container">
      <EditorContent editor={editor} className="tiptap" />
      {formulaResult && (
        <div
          className={`result ${formulaResult === "Invalid" ? "invalid" : ""}`}
        >
          Result: {formulaResult}
        </div>
      )}
      <div className="hint">
        Use numbers and operators (e.g., 2 + 3). Type '@' after a space (not
        next to a character) to fetch functions.
      </div>
    </div>
  );
};

export default FormulaInput;
