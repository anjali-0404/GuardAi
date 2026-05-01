"use client";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
}

export function CodeEditor({ value, onChange, language }: CodeEditorProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Paste your ${language} code here...`}
      className="w-full h-[500px] p-6 bg-transparent text-foreground font-mono text-sm resize-none focus:outline-none placeholder:text-muted-foreground/30 leading-relaxed"
      spellCheck={false}
    />
  );
}
