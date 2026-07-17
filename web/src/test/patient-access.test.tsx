import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import PatientAccessPage from "@/app/prototype/patient/access/page";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("Patient Access", () => {
  beforeEach(() => {
    push.mockReset();
  });

  test("renders one clear and accessible code entry path", () => {
    render(<PatientAccessPage />);

    expect(
      screen.getByRole("heading", { name: /selamat datang/i }),
    ).toBeVisible();
    expect(screen.getByLabelText(/kode akses/i)).toHaveAttribute(
      "inputmode",
      "numeric",
    );
    expect(
      screen.getByRole("button", { name: /masuk dengan kode/i }),
    ).toBeVisible();
    expect(screen.getByText(/privasi anda tetap dijaga/i)).toBeVisible();
  });

  test("shows a safe error without revealing a Patient Profile", async () => {
    const user = userEvent.setup();
    render(<PatientAccessPage />);

    await user.type(screen.getByLabelText(/kode akses/i), "123456");
    await user.click(
      screen.getByRole("button", { name: /masuk dengan kode/i }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Kode tidak valid atau sudah tidak berlaku",
    );
    expect(screen.queryByText(/Maya Pratama/i)).not.toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  test("shows progress before the synthetic demo code opens Patient Home", async () => {
    const user = userEvent.setup();
    render(<PatientAccessPage />);

    await user.type(screen.getByLabelText(/kode akses/i), "204682");
    await user.click(
      screen.getByRole("button", { name: /masuk dengan kode/i }),
    );

    expect(
      screen.getByRole("button", { name: /memeriksa kode/i }),
    ).toBeDisabled();
    expect(push).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/prototype/patient/home");
    });
  });
});
