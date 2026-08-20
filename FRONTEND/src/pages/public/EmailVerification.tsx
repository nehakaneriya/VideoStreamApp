import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OtpModal from "@/components/auth/OtpModal";

const EMAIL_KEY = "verify_email";

export default function EmailVerification() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email] = useState(
    (location.state as { email?: string } | null)?.email ?? sessionStorage.getItem(EMAIL_KEY) ?? ""
  );

  return (
    <div className="min-h-screen bg-[#09090b]">
      <OtpModal
        email={email}
        onSuccess={() => {
          sessionStorage.removeItem(EMAIL_KEY);
          navigate("/login");
        }}
        onClose={() => navigate("/login")}
      />
    </div>
  );
}