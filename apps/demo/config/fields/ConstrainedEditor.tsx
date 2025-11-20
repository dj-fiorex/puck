"use client";

import { useEffect, useRef } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type * as monaco from "monaco-editor";

interface ConstrainedEditorProps {
  prefix: string;
  suffix: string;
  language?: string;
  defaultContent?: string;
  onChange?: (fullContent: string, editableContent: string) => void;
  height?: string;
  theme?: "vs-dark" | "light";
}

export default function ConstrainedEditor({
  prefix,
  suffix,
  language = "css",
  defaultContent = "",
  onChange,
  height = "400px",
  theme = "vs-dark",
}: ConstrainedEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);
  const previousContentRef = useRef<string>("");
  const isUpdatingRef = useRef(false);
  const decorationsRef =
    useRef<monaco.editor.IEditorDecorationsCollection | null>(null);

  const validateAndRestoreContent = (
    editor: monaco.editor.IStandaloneCodeEditor,
  ) => {
    if (isUpdatingRef.current) return;

    const model = editor.getModel();
    if (!model) return;

    const currentContent = model.getValue();
    const lines = currentContent.split("\n");

    const prefixLines = prefix.split("\n");
    const suffixLines = suffix.split("\n");

    // Verifica che ci siano abbastanza righe
    const minLines = prefixLines.length + suffixLines.length;
    if (lines.length < minLines) {
      isUpdatingRef.current = true;
      model.setValue(previousContentRef.current);
      isUpdatingRef.current = false;
      return;
    }

    // Verifica che le righe del prefix non siano state modificate
    for (let i = 0; i < prefixLines.length; i++) {
      if (lines[i] !== prefixLines[i]) {
        isUpdatingRef.current = true;
        const position = editor.getPosition();
        model.setValue(previousContentRef.current);
        // Ripristina la posizione del cursore se era nell'area valida
        if (
          position &&
          position.lineNumber > prefixLines.length &&
          position.lineNumber <= lines.length - suffixLines.length
        ) {
          editor.setPosition(position);
        }
        isUpdatingRef.current = false;
        return;
      }
    }

    // Verifica che le righe del suffix non siano state modificate
    for (let i = 0; i < suffixLines.length; i++) {
      const lineIndex = lines.length - suffixLines.length + i;
      if (lines[lineIndex] !== suffixLines[i]) {
        isUpdatingRef.current = true;
        const position = editor.getPosition();
        model.setValue(previousContentRef.current);
        if (
          position &&
          position.lineNumber > prefixLines.length &&
          position.lineNumber <= lines.length - suffixLines.length
        ) {
          editor.setPosition(position);
        }
        isUpdatingRef.current = false;
        return;
      }
    }

    // Se tutto è valido, aggiorna il contenuto precedente
    previousContentRef.current = currentContent;

    // Estrai il contenuto modificabile (tra prefix e suffix)
    const editableLines = lines.slice(
      prefixLines.length,
      lines.length - suffixLines.length,
    );
    const editableContent = editableLines.join("\n");

    onChange?.(currentContent, editableContent);
  };

  const updateDecorations = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monacoInstance: typeof monaco,
  ) => {
    const model = editor.getModel();
    if (!model) return;

    const lines = model.getLinesContent();
    const prefixLines = prefix.split("\n");
    const suffixLines = suffix.split("\n");

    const decorations: monaco.editor.IModelDeltaDecoration[] = [];

    for (let i = 0; i < prefixLines.length; i++) {
      decorations.push({
        range: new monacoInstance.Range(i + 1, 1, i + 1, lines[i].length + 1),
        options: {
          isWholeLine: false,
          className: "read-only-line",
          glyphMarginClassName: "read-only-glyph",
          hoverMessage: {
            value: "**Read-only:** This line cannot be modified",
          },
        },
      });
    }

    for (let i = 0; i < suffixLines.length; i++) {
      const lineNumber = lines.length - suffixLines.length + i + 1;
      decorations.push({
        range: new monacoInstance.Range(
          lineNumber,
          1,
          lineNumber,
          lines[lineNumber - 1].length + 1,
        ),
        options: {
          isWholeLine: false,
          className: "read-only-line",
          glyphMarginClassName: "read-only-glyph",
          hoverMessage: {
            value: "**Read-only:** This line cannot be modified",
          },
        },
      });
    }

    if (decorationsRef.current) {
      decorationsRef.current.clear();
    }
    decorationsRef.current = editor.createDecorationsCollection(decorations);
  };

  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;

    const content = `${prefix}\n${defaultContent}\n${suffix}`;
    editor.setValue(content);
    previousContentRef.current = content;

    const model = editor.getModel();
    if (!model) return;

    updateDecorations(editor, monacoInstance);

    // Posiziona il cursore nell'area modificabile
    const prefixLines = prefix.split("\n");
    editor.setPosition({ lineNumber: prefixLines.length + 1, column: 1 });

    editor.onDidChangeModelContent(() => {
      validateAndRestoreContent(editor);
    });

    // Emetti il valore iniziale
    onChange?.(content, defaultContent);
  };

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;

    const currentContent = editor.getValue();
    const lines = currentContent.split("\n");
    const prefixLines = prefix.split("\n");
    const suffixLines = suffix.split("\n");

    // Estrai solo il contenuto modificabile
    const editableLines = lines.slice(
      prefixLines.length,
      lines.length - suffixLines.length,
    );
    const editableContent = editableLines.join("\n");

    // Crea il nuovo contenuto con il nuovo prefix/suffix
    const newContent = `${prefix}\n${editableContent}\n${suffix}`;

    // Salva la posizione del cursore
    const position = editor.getPosition();

    isUpdatingRef.current = true;
    editor.setValue(newContent);
    previousContentRef.current = newContent;
    isUpdatingRef.current = false;

    updateDecorations(editor, monacoRef.current);

    // Ripristina la posizione del cursore se possibile
    const newLines = model.getLinesContent();
    const newPrefixLines = prefix.split("\n");
    const newSuffixLines = suffix.split("\n");

    if (
      position &&
      position.lineNumber > newPrefixLines.length &&
      position.lineNumber <= newLines.length - newSuffixLines.length
    ) {
      editor.setPosition(position);
    } else {
      editor.setPosition({ lineNumber: newPrefixLines.length + 1, column: 1 });
    }

    onChange?.(newContent, editableContent);
  }, [prefix, suffix, onChange]);

  return (
    <div className="border-border overflow-hidden rounded-lg border">
      <style jsx global>{`
        .read-only-line {
          background-color: rgba(255, 200, 0, 0.1);
          border-left: 3px solid rgba(255, 200, 0, 0.5);
        }
        .read-only-glyph {
          background-color: rgba(255, 200, 0, 0.3);
        }
      `}</style>
      <Editor
        height={height}
        defaultLanguage={language}
        onMount={handleEditorDidMount}
        theme={theme}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          glyphMargin: true,
          folding: false,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
          padding: { top: 16, bottom: 16 },
        }}
      />
    </div>
  );
}
