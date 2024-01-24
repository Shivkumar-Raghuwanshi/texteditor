"use client";


// Import necessary modules from react and draft-js
import { useState } from "react";
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
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import Typewriter from "typewriter-effect";
import { FaGithub } from "react-icons/fa6";
import Link from "next/link";
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
const MyEditor: React.FC = () => {
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
  // Initialize the alert state
  const [alert, setAlert] = useState(false);

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
    setAlert(true);
  };

  // Render the editor
  return (
    <div className=" ">
      <div className="flex justify-between items-center p-4">
        <h1 className="text-sm md:text-xl lg:text-2xl text-center font-medium">
          Demo Text Editor By Shivkumar Raghuwanshi
        </h1>
        <div className="flex justify-center items-center gap-8">
          <Button onClick={saveContent}>Save</Button>
          <Link href={"https://github.com/Shivkumar-Raghuwanshi/texteditor"} target="_blank">
            <FaGithub className="w-8 h-10" />
          </Link>
        </div>
      </div>
      <div className="bg-slate-900">
        <div className="">
          <span className="text-center text-white font-semibold text-sm md:text-xl lg:text-2xl m-4 p-2">
            <Typewriter
              options={{
                strings: [
                  `1. Enter "#" and "space" for heading `,
                  `2. Enter "*" and "space" for bold text`,
                  `3. Enter "**" and "space" for red text`,
                  `4. Enter "***" and "space" for underline`,
                ],
                autoStart: true,
                loop: true,
              }}
            />
          </span>
        </div>
        <div className="flex justify-center items-start p-10">
          <div className="w-full p-4 bg-white rounded-lg shadow ">
            <div className="p-2 border border-gray-400 rounded">
              <Editor
                editorState={editorState}
                handleKeyCommand={handleKeyCommand}
                onChange={setEditorState}
                handleBeforeInput={handleBeforeInput}
                blockStyleFn={myBlockStyleFn}
                placeholder="Enter here ..."
              />
            </div>
          </div>
        </div>
      </div>

      {alert && (
        <Alert>
          <AlertDescription className="text-green-600 text-center font-medium md:text-lg w-full md:w-96 md:mx-auto justify-self-center">
            Your input saved successfully!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MyEditor;
