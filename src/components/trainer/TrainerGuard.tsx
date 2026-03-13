import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTrainerSession } from "@/lib/trainerAuth";

interface TrainerGuardProps {
  children: React.ReactNode;
}

const TrainerGuard = ({ children }: TrainerGuardProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!getTrainerSession()) {
      navigate("/trainer/login", { replace: true });
    }
  }, [navigate]);

  if (!getTrainerSession()) return null;
  return <>{children}</>;
};

export default TrainerGuard;
