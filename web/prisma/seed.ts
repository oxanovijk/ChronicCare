import "dotenv/config";

import assert from "node:assert/strict";
import * as crypto from "node:crypto";

import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";

import { PrismaClient } from "../src/generated/prisma/client";
import { requireProviderConfig } from "../src/lib/config/provider-policy";
import { inspectSupabaseAdminEnv } from "../src/lib/env/server-schema";
import { patientProfileFactsSchema } from "../src/lib/db/profile-facts";

const ids = {
  careCircle: "10000000-0000-4000-8000-000000000001",
  ownerMember: "10000000-0000-4000-8000-000000000002",
  familyMember: "10000000-0000-4000-8000-000000000003",
  maya: "10000000-0000-4000-8000-000000000004",
  raka: "10000000-0000-4000-8000-000000000005",
  mayaCode: "10000000-0000-4000-8000-000000000006",
  rakaCode: "10000000-0000-4000-8000-000000000007",
} as const;

const demoUsers = [
  {
    email: "dimas.pratama@chronicare.example",
    displayName: "Dimas Pratama",
  },
  {
    email: "rina.pratama@chronicare.example",
    displayName: "Rina Pratama",
  },
] as const;

// Argon2id fixture hashes only. No reusable Patient code is committed or logged.
const fixtureCodeHashes = {
  maya:
    "$argon2id$v=19$m=65536,t=3,p=1$wjma+KnjtTOi3Xe4RwAuGg$8Kci3tpRr9Q7kQT2MjUxhXUe5E/A3b57FuDkqR+/m7E",
  raka:
    "$argon2id$v=19$m=65536,t=3,p=1$3HZppNYH2Oe8AlK9I0AL0Q$Pfn+9RV1xTi/vzIfks6ZKaR403JsVdSBKD2F8WQK8Vg",
} as const;

type NativeArgon2 = (
  algorithm: "argon2id",
  parameters: {
    message: Buffer;
    nonce: Buffer;
    parallelism: number;
    tagLength: number;
    memory: number;
    passes: number;
  },
  callback: (error: Error | null | undefined, result?: Buffer) => void,
) => void;

const argon2 = (crypto as unknown as { argon2: NativeArgon2 }).argon2;

async function hashPatientCode(code: string) {
  const memory = 65_536;
  const passes = 3;
  const parallelism = 1;
  const nonce = crypto.randomBytes(16);
  const hash = await new Promise<Buffer>((resolve, reject) => {
    argon2(
      "argon2id",
      {
        message: Buffer.from(code),
        nonce,
        parallelism,
        tagLength: 32,
        memory,
        passes,
      },
      (error, result) => {
        if (error || !result) reject(error ?? new Error("Argon2 failed"));
        else resolve(result);
      },
    );
  });

  return `$argon2id$v=19$m=${memory},t=${passes},p=${parallelism}$${nonce.toString("base64")}$${hash.toString("base64")}`;
}

async function main() {
  let stage = "configuration";
  const directUrl = process.env["DIRECT_URL"];
  if (
    !directUrl ||
    !["postgres:", "postgresql:"].includes(new URL(directUrl).protocol)
  ) {
    throw new Error("Synthetic Packet 03 seed requires a valid DIRECT_URL");
  }
  const supabaseEnv = requireProviderConfig(
    "Supabase admin",
    inspectSupabaseAdminEnv(process.env),
  );
  const configuredCodeHashes = {
    maya: process.env["PATIENT_DEMO_MAYA_CODE"]
      ? await hashPatientCode(process.env["PATIENT_DEMO_MAYA_CODE"])
      : null,
    raka: process.env["PATIENT_DEMO_RAKA_CODE"]
      ? await hashPatientCode(process.env["PATIENT_DEMO_RAKA_CODE"])
      : null,
  };
  const codeHashes = {
    maya: configuredCodeHashes.maya ?? fixtureCodeHashes.maya,
    raka: configuredCodeHashes.raka ?? fixtureCodeHashes.raka,
  };
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: directUrl }),
  });
  const supabase = createClient(
    supabaseEnv.NEXT_PUBLIC_SUPABASE_URL,
    supabaseEnv.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  try {
    stage = "auth-user lookup";
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1_000,
    });
    if (error) throw new Error("Could not resolve synthetic auth users");

    const authUserIds = new Map(data.users.map((user) => [user.email, user.id]));
    for (const user of demoUsers) {
      if (authUserIds.has(user.email)) continue;

      stage = "auth-user creation";
      const created = await supabase.auth.admin.createUser({
        email: user.email,
        password: `${crypto.randomBytes(32).toString("base64url")}Aa1!`,
        email_confirm: true,
        user_metadata: { display_name: user.displayName },
      });
      if (created.error || !created.data.user) {
        throw new Error("Could not create a synthetic auth user");
      }
      authUserIds.set(user.email, created.data.user.id);
    }

    const ownerId = authUserIds.get(demoUsers[0].email);
    const familyId = authUserIds.get(demoUsers[1].email);
    assert(ownerId && familyId);

    stage = "public-user upsert";
    await prisma.user.upsert({
      where: { id: ownerId },
      create: { id: ownerId, displayName: demoUsers[0].displayName },
      update: { displayName: demoUsers[0].displayName },
    });
    await prisma.user.upsert({
      where: { id: familyId },
      create: { id: familyId, displayName: demoUsers[1].displayName },
      update: { displayName: demoUsers[1].displayName },
    });

    const mayaFacts = patientProfileFactsSchema.parse({
      primaryConditions: ["Diabetes tipe 2"],
      primaryConditionsStatus: "REPORTED",
      allergies: [],
      allergiesStatus: "NONE_REPORTED",
      currentMedicationsStatus: "UNKNOWN",
      emergencyContactName: "Dimas Pratama",
      emergencyContactPhone: null,
      emergencyContactStatus: "REPORTED",
      bpjsNumberLast4: "2468",
      bpjsMembershipStatus: "REGISTERED",
    });
    const rakaFacts = patientProfileFactsSchema.parse({
      primaryConditions: ["Hipertensi"],
      primaryConditionsStatus: "REPORTED",
      allergies: [],
      allergiesStatus: "UNKNOWN",
      currentMedicationsStatus: "UNKNOWN",
      emergencyContactName: null,
      emergencyContactPhone: null,
      emergencyContactStatus: "UNKNOWN",
      bpjsNumberLast4: null,
      bpjsMembershipStatus: "UNKNOWN",
    });

    stage = "care-circle transaction";
    await prisma.$transaction(async (tx) => {
      await tx.careCircle.upsert({
        where: { id: ids.careCircle },
        create: {
          id: ids.careCircle,
          name: "Keluarga Pratama",
          createdByUserId: ownerId,
        },
        update: { name: "Keluarga Pratama", isActive: true },
      });
      await tx.careCircleMember.upsert({
        where: {
          careCircleId_userId: { careCircleId: ids.careCircle, userId: ownerId },
        },
        create: {
          id: ids.ownerMember,
          careCircleId: ids.careCircle,
          userId: ownerId,
          role: "OWNER",
          status: "ACTIVE",
          joinedAt: new Date(),
        },
        update: { role: "OWNER", status: "ACTIVE" },
      });
      await tx.careCircleMember.upsert({
        where: {
          careCircleId_userId: { careCircleId: ids.careCircle, userId: familyId },
        },
        create: {
          id: ids.familyMember,
          careCircleId: ids.careCircle,
          userId: familyId,
          role: "FAMILY_MEMBER",
          status: "ACTIVE",
          invitedByUserId: ownerId,
          joinedAt: new Date(),
        },
        update: {
          role: "FAMILY_MEMBER",
          status: "ACTIVE",
          invitedByUserId: ownerId,
        },
      });

      await tx.patientProfile.upsert({
        where: { id: ids.maya },
        create: {
          id: ids.maya,
          careCircleId: ids.careCircle,
          displayName: "Maya Pratama",
          relationshipLabel: "Maya",
          dateOfBirth: new Date("1982-08-12T00:00:00.000Z"),
          city: "Tangerang",
          locationLabel: "Karawaci, Tangerang",
          usualFacilityName: null,
          createdByUserId: ownerId,
          ...mayaFacts,
        },
        update: {
          displayName: "Maya Pratama",
          relationshipLabel: "Maya",
          dateOfBirth: new Date("1982-08-12T00:00:00.000Z"),
          city: "Tangerang",
          locationLabel: "Karawaci, Tangerang",
          usualFacilityName: null,
          updatedByUserId: ownerId,
          deletedAt: null,
          status: "ACTIVE",
          deactivationReason: null,
          deactivationNote: null,
          deactivatedByUserId: null,
          deactivatedAt: null,
          ...mayaFacts,
        },
      });
      await tx.patientProfile.upsert({
        where: { id: ids.raka },
        create: {
          id: ids.raka,
          careCircleId: ids.careCircle,
          displayName: "Raka Pratama",
          relationshipLabel: "Raka",
          city: "Tangerang",
          createdByUserId: ownerId,
          ...rakaFacts,
        },
        update: {
          displayName: "Raka Pratama",
          relationshipLabel: "Raka",
          city: "Tangerang",
          updatedByUserId: ownerId,
          deletedAt: null,
          status: "ACTIVE",
          deactivationReason: null,
          deactivationNote: null,
          deactivatedByUserId: null,
          deactivatedAt: null,
          ...rakaFacts,
        },
      });

      await tx.patientAccessCode.updateMany({
        where: {
          patientProfileId: { in: [ids.maya, ids.raka] },
          id: { notIn: [ids.mayaCode, ids.rakaCode] },
          status: "ACTIVE",
        },
        data: { status: "REVOKED" },
      });
      await tx.patientAccessCode.upsert({
        where: { id: ids.mayaCode },
        create: {
          id: ids.mayaCode,
          patientProfileId: ids.maya,
          codeHash: codeHashes.maya,
          createdByUserId: ownerId,
        },
        update: {
          ...(configuredCodeHashes.maya
            ? { codeHash: configuredCodeHashes.maya }
            : {}),
          status: "ACTIVE",
          failedAttemptCount: 0,
          lockedUntil: null,
          lastUsedAt: null,
          expiresAt: null,
        },
      });
      await tx.patientAccessCode.upsert({
        where: { id: ids.rakaCode },
        create: {
          id: ids.rakaCode,
          patientProfileId: ids.raka,
          codeHash: codeHashes.raka,
          createdByUserId: ownerId,
        },
        update: {
          ...(configuredCodeHashes.raka
            ? { codeHash: configuredCodeHashes.raka }
            : {}),
          status: "ACTIVE",
          failedAttemptCount: 0,
          lockedUntil: null,
          lastUsedAt: null,
          expiresAt: null,
        },
      });
    });

    stage = "seed verification";
    const seeded = await prisma.careCircle.findUniqueOrThrow({
      where: { id: ids.careCircle },
      include: {
        members: true,
        patientProfiles: { include: { accessCodes: true } },
      },
    });
    assert.equal(seeded.members.length, 2);
    assert.equal(seeded.patientProfiles.length, 2);
    assert(
      seeded.patientProfiles.every(
        (profile) =>
          profile.status === "ACTIVE" &&
          profile.deactivationReason === null &&
          profile.deactivationNote === null &&
          profile.deactivatedByUserId === null &&
          profile.deactivatedAt === null,
      ),
    );
    assert(
      seeded.patientProfiles.every(
        (profile) =>
          profile.accessCodes.length === 1 &&
          profile.accessCodes[0]?.status === "ACTIVE" &&
          profile.accessCodes[0]?.failedAttemptCount === 0 &&
          profile.accessCodes[0]?.lockedUntil === null &&
          profile.accessCodes[0]?.expiresAt === null,
      ),
    );
    console.info("Synthetic Packet 03 seed applied and verified.");
  } catch {
    throw new Error(`Synthetic Packet 03 seed failed during ${stage}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Synthetic Packet 03 seed failed",
  );
  process.exitCode = 1;
});
