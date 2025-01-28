import { FallingLines } from "react-loader-spinner";

const Loader = () => {
  return (
    <div
      className="loader"
      style={{
        display: "grid",
        placeContent: "center",
      }}
    >
      <FallingLines color="#ef8236" width="100" visible={true} />
    </div>
  );
};

export default Loader;
