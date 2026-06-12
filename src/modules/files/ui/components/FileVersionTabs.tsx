"use client";

import { useState } from "react";
import Image from "next/image";
import { AiOutlineFilePdf } from "react-icons/ai";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ApprovalBadge } from "./ApprovalBadge";
import { ApprovalBanner } from "./ApprovalBanner";
import { VersionUpload } from "./VersionUpload";
import { useGetVersions } from "../../api/use-get-versions";
import { Skeleton } from "@/components/ui/skeleton";
import { useDownloadVersion } from "../../api/use-download-version";
import { DownloadIcon } from "lucide-react";

interface FileVersionTabsProps {
  fileId: string;
  projectId: string;
  projectClientId: string;
  isClient: boolean;
}

export const FileVersionTabs = ({
  fileId,
  projectId,
  projectClientId,
  isClient,
}: FileVersionTabsProps) => {
  const { data: versions, isLoading } = useGetVersions({ fileId });
  const downloadVersion = useDownloadVersion();
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-lg" />;
  }

  if (!versions?.length) return null;

  const activeId = selectedId ?? versions[0].id;
  const activeVersion = versions.find((v) => v.id === activeId) ?? versions[0];
  const latestApproval = activeVersion.approvals[0];
  const isLatestVersion = activeVersion.id === versions[0].id;
  const showRevisionUpload =
    !isClient &&
    isLatestVersion &&
    latestApproval?.status === "REVISION_REQUESTED";

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Version selector */}
      <Select value={activeId} onValueChange={setSelectedId}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select version" />
        </SelectTrigger>
        <SelectContent>
          {versions.map((v) => (
            <SelectItem key={v.id} value={v.id}>
              <div className="flex w-full items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">v{v.version}</span>
                  {v.id === versions[0].id && (
                    <span className="text-muted-foreground text-xs">
                      (latest)
                    </span>
                  )}
                  <ApprovalBadge status={v.approvals[0]?.status} />
                </div>
                <span className="text-muted-foreground text-xs">
                  {new Date(v.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* File preview */}
      {activeVersion.mimeType === "application/pdf" ? (
        <div className="group bg-muted relative flex h-64 w-full items-center justify-center rounded-md">
          <AiOutlineFilePdf className="size-20 text-red-500" />
          <Button
            size="icon"
            variant="outline"
            onClick={() => downloadVersion(activeVersion.id)}
            className="absolute top-2 right-2 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
          >
            <DownloadIcon className="size-4" />
          </Button>
        </div>
      ) : (
        <div className="group relative w-full">
          <Image
            src={activeVersion.url}
            alt={`Version ${activeVersion.version}`}
            width={600}
            height={400}
            className="w-full rounded-md object-cover"
          />
          <Button
            size="icon"
            variant="outline"
            onClick={() => downloadVersion(activeVersion.id)}
            className="absolute top-2 right-2 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
          >
            <DownloadIcon className="size-4" />
          </Button>
        </div>
      )}

      <ApprovalBanner
        fileId={fileId}
        projectId={projectId}
        fileVersionId={activeVersion.id}
        approval={latestApproval}
        isClient={isClient}
        projectClientId={projectClientId}
      />

      {showRevisionUpload && (
        <VersionUpload fileId={fileId} projectId={projectId} />
      )}
    </div>
  );
};
