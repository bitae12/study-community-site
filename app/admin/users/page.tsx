"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { HazeCard } from "@/components/ui/card";
import { getDataClient } from "@/lib/data/index";
import type { Profile, Role } from "@/lib/data/types";
import { formatDate } from "@/lib/utils";

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);

  async function refresh() {
    setProfiles(await getDataClient().listProfiles());
  }

  useEffect(() => {
    let cancelled = false;
    void getDataClient()
      .listProfiles()
      .then((data) => {
        if (!cancelled) setProfiles(data);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function setRole(id: string, role: Role) {
    await getDataClient().updateProfileRole(id, role);
    await refresh();
  }

  return (
    <HazeCard>
      <h2 className="mb-4 text-xl font-medium text-[var(--color-ink)]">회원 목록</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 text-[var(--color-ink)]/60">
              <th className="py-2 pr-4">닉네임</th>
              <th className="py-2 pr-4">이메일</th>
              <th className="py-2 pr-4">역할</th>
              <th className="py-2 pr-4">가입일</th>
              <th className="py-2">작업</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id} className="border-b border-black/5">
                <td className="py-3 pr-4">{profile.displayName}</td>
                <td className="py-3 pr-4">{profile.email}</td>
                <td className="py-3 pr-4">{profile.role}</td>
                <td className="py-3 pr-4">{formatDate(profile.createdAt)}</td>
                <td className="py-3">
                  {profile.role === "admin" ? (
                    <Button
                      type="button"
                      variant="haze"
                      onClick={() => setRole(profile.id, "user")}
                    >
                      user로 변경
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="haze"
                      onClick={() => setRole(profile.id, "admin")}
                    >
                      admin 지정
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </HazeCard>
  );
}
