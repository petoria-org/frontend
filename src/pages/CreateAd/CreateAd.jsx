import { useLocation, useNavigate } from "react-router-dom";
import { NotificationOptionsSection } from "../../components/NotificationOptionsSection";

const CreateAd = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleExit = () => {
    const from = location.state?.from;

    if (typeof from === "string" && from.length > 0) {
      navigate(from, { replace: true });
      return;
    }

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/", { replace: true });
  };

  return (
    <div className="create-ad-page">
      <NotificationOptionsSection
        mode="create"
        onSave={handleExit}
        onClose={handleExit}
      />
    </div>
  );
};

export default CreateAd;