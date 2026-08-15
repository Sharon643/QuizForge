import { useNavigate } from "react-router-dom";

import Button from "../ui/Button";

function ModeSelector() {
  const navigate = useNavigate();

  return (
    <div className="mt-8 space-y-4">
      <Button onClick={() => navigate("/exam-settings")}>
        🏆 Exam Mode
      </Button>

      <Button onClick={() => {}}>
        📚 Practice Mode
      </Button>

      <Button onClick={() => {}}>
        📖 Review Mode
      </Button>
    </div>
  );
}

export default ModeSelector;