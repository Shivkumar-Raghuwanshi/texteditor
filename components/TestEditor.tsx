"use client";

// Import necessary modules from react and draft-js
import { useState, useEffect } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  DraftHandleValue,
  Modifier,
  convertToRaw,
  convertFromRaw,
  ContentBlock,
} from "draft-js";

// Function to apply custom block styles
function myBlockStyleFn(contentBlock: ContentBlock): string {
  const type = contentBlock.getType();
  // Apply the corresponding CSS class based on the block type
  if (type === "header-one") {
    return "superFancyHeader";
  } else if (type === "bold-text") {
    return "bold";
  } else if (type === "red-text") {
    return "red";
  } else if (type === "underline-text") {
    return "underline";
  }
  return ""; // return an empty string as the default
}

// Main component
const TestEditor: React.FC = () => {
  // Initialize the editor state
  const [editorState, setEditorState] = useState(() => {
    const savedData =
      typeof window !== "undefined"
        ? localStorage.getItem("editorContent")
        : null;
    return savedData
      ? EditorState.createWithContent(convertFromRaw(JSON.parse(savedData)))
      : EditorState.createEmpty();
  });

  // Save the editor state to local storage whenever it changes
  useEffect(() => {
    const rawContentState = convertToRaw(editorState.getCurrentContent());
    localStorage.setItem("editorContent", JSON.stringify(rawContentState));
  }, [editorState]);

  // Handle keyboard commands
  const handleKeyCommand = (
    command: string,
    editorState: EditorState
  ): DraftHandleValue => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  // Handle input before it's inserted into the editor
  const handleBeforeInput = (chars: string) => {
    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();
    const currentBlock = content.getBlockForKey(selection.getStartKey());
    const start = selection.getStartOffset();
    const blockText = currentBlock.getText();

    // Only handle the input if it's a space
    if (chars !== " ") {
      return "not-handled";
    }

    let newEditorState;
    // Apply the corresponding block type or inline style based on the input
    switch (
      blockText.trim() // use trim() to remove the space at the end
    ) {
      case "#":
        newEditorState = RichUtils.toggleBlockType(editorState, "header-one");
        break;
      case "*":
        newEditorState = RichUtils.toggleBlockType(editorState, "bold-text");
        break;
      case "**":
        newEditorState = RichUtils.toggleBlockType(editorState, "red-text");
        break;
      case "***":
        newEditorState = RichUtils.toggleBlockType(
          editorState,
          "underline-text"
        );
        break;
      default:
        return "not-handled";
    }

    // Replace the markdown-like syntax with an empty string
    const newContentState = Modifier.replaceText(
      newEditorState.getCurrentContent(),
      selection.merge({
        anchorOffset: start - blockText.trim().length,
        focusOffset: start,
      }),
      ""
    );

    // Update the editor state
    setEditorState(
      EditorState.push(newEditorState, newContentState, "change-inline-style")
    );

    return "handled";
  };

  // Save the current content to local storage
  const saveContent = () => {
    const rawContentState = convertToRaw(editorState.getCurrentContent());
    localStorage.setItem("editorContent", JSON.stringify(rawContentState));
  };

  // Render the editor
  return (
    <div className="m-10">
      <button onClick={saveContent}>Save</button>
      <Editor
        editorState={editorState}
        handleKeyCommand={handleKeyCommand}
        onChange={setEditorState}
        handleBeforeInput={handleBeforeInput}
        blockStyleFn={myBlockStyleFn}
      />
    </div>
  );
};

export default TestEditor;
