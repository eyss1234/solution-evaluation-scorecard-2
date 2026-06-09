"use client";

import { useState } from "react";
import { EditProjectName } from "./EditProjectName";
import { ProjectActionsMenu } from "./ProjectActionsMenu";
import { ExportProjectPdfButton } from "./ExportProjectPdfButton";

interface ProjectHeaderProps {
  projectId: string;
  initialName: string;
}

/**
 * Top-of-page header: the inline-editable project name plus the export and
 * 3-dot action controls. Owns the shared "editing" state so the menu's Rename
 * action and the name's own pencil both drive the same inline editor.
 */
export function ProjectHeader({ projectId, initialName }: ProjectHeaderProps) {
  const [name, setName] = useState(initialName);
  const [editing, setEditing] = useState(false);

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <EditProjectName
        projectId={projectId}
        name={name}
        editing={editing}
        onStartEdit={() => setEditing(true)}
        onCancel={() => setEditing(false)}
        onSaved={(newName) => {
          setName(newName);
          setEditing(false);
        }}
      />
      <div className="flex items-center gap-2 print:hidden">
        <ExportProjectPdfButton />
        <ProjectActionsMenu
          projectId={projectId}
          projectName={name}
          onRename={() => setEditing(true)}
        />
      </div>
    </div>
  );
}
