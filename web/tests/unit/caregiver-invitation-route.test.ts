import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  acceptInvitation: vi.fn(),
  createInvitation: vi.fn(),
  getInvitationPreview: vi.fn(),
  resolveAuthenticatedCaregiverUser: vi.fn(),
  resolveCaregiverAuthContext: vi.fn(),
}));

vi.mock("@/lib/auth/caregiver", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/caregiver")>()),
  resolveAuthenticatedCaregiverUser: mocks.resolveAuthenticatedCaregiverUser,
  resolveCaregiverAuthContext: mocks.resolveCaregiverAuthContext,
}));
vi.mock("@/lib/invitations/service", () => ({
  acceptInvitation: mocks.acceptInvitation,
  createInvitation: mocks.createInvitation,
  getInvitationPreview: mocks.getInvitationPreview,
}));

import { POST as CREATE } from "@/app/api/v1/care-circle/invitations/route";
import { GET as PREVIEW } from "@/app/api/v1/care-circle/invitations/[token]/route";
import { POST as ACCEPT } from "@/app/api/v1/care-circle/invitations/[token]/accept/route";

const token = "A".repeat(43);
const routeContext = { params: Promise.resolve({ token }) };

function post(url: string, body: unknown, origin = "http://localhost") {
  return new Request(url, {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("caregiver invitation routes", () => {
  beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockReset()));

  it("creates an Owner invitation with server context", async () => {
    const owner = {
      actorType: "CAREGIVER",
      user: { id: "owner-id", displayName: "Dimas" },
      membership: { careCircleId: "circle-id", role: "OWNER" },
    };
    mocks.resolveCaregiverAuthContext.mockResolvedValue(owner);
    mocks.createInvitation.mockResolvedValue({ id: "invite-id" });
    const response = await CREATE(
      post("http://localhost/api/v1/care-circle/invitations", {
        expiresInHours: 24,
      }),
    );
    expect(response.status).toBe(201);
    expect(mocks.createInvitation).toHaveBeenCalledWith(
      owner,
      { expiresInHours: 24 },
      expect.objectContaining({ requestId: expect.stringMatching(/^req_/) }),
    );
  });

  it("previews and accepts without client role or Care Circle input", async () => {
    mocks.getInvitationPreview.mockResolvedValue({
      careCircleName: "Keluarga Dimas",
      expiresAt: "2026-07-18T08:00:00.000Z",
    });
    const preview = await PREVIEW(
      new Request(`http://localhost/api/v1/care-circle/invitations/${token}`),
      routeContext,
    );
    expect(preview.status).toBe(200);

    mocks.resolveAuthenticatedCaregiverUser.mockResolvedValue({ id: "family-id" });
    mocks.acceptInvitation.mockResolvedValue({
      membership: { careCircleId: "circle-id", role: "FAMILY_MEMBER" },
    });
    const accepted = await ACCEPT(
      post(
        `http://localhost/api/v1/care-circle/invitations/${token}/accept`,
        { displayName: "Rina" },
      ),
      routeContext,
    );
    expect(accepted.status).toBe(200);
    expect(mocks.acceptInvitation).toHaveBeenCalledWith(
      { id: "family-id" },
      token,
      { displayName: "Rina" },
      expect.objectContaining({ requestId: expect.stringMatching(/^req_/) }),
    );

    const hostile = await ACCEPT(
      post(
        `http://localhost/api/v1/care-circle/invitations/${token}/accept`,
        { displayName: "Rina", role: "OWNER" },
      ),
      routeContext,
    );
    expect(hostile.status).toBe(400);
  });
});
