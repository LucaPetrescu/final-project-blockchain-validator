import React from "react";

interface CreateMarketButtonProps {
  onClick: () => void;
}

const CreateMarketButton: React.FC<CreateMarketButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700"
    >
      Create Market
    </button>
  );
};

export default CreateMarketButton;
