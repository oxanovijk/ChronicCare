import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { completeOwnerOnboarding } from "@/lib/onboarding/owner-service";
import { ownerOnboardingInputFromMetadata } from "@/lib/onboarding/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null) {
  return value?.startsWith("/caregiver") && !value.startsWith("//")
    ? value
    : "/caregiver";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));
  if (!code) {
    return NextResponse.redirect(new URL("/caregiver?auth=callback-error", url));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL("/caregiver?auth=callback-error", url),
    );
  }

  if (next === "/caregiver") {
    const { data, error: userError } = await supabase.auth.getUser();
    if (userError || !data.user) {
      return NextResponse.redirect(
        new URL("/caregiver?auth=callback-error", url),
      );
    }
    const input = ownerOnboardingInputFromMetadata(data.user.user_metadata);
    if (input) {
      try {
        await completeOwnerOnboarding(
          { id: data.user.id },
          input,
          { requestId: `req_${randomUUID()}` },
        );
      } catch {
        return NextResponse.redirect(
          new URL("/caregiver?auth=callback-error", url),
        );
      }
    }
  }

  return NextResponse.redirect(new URL(next, url));
}
