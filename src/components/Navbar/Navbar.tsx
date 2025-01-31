import { readContract, writeContract } from "@wagmi/core";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { questifyABI } from "../../abi/questifyABI";
import bars from "../../assets/bars-solid.svg";
import { config } from "../../config";
import { questifyAddress } from "../../constants";

const Navbar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { address } = useAccount();
  const [userStats, setUserStats] = useState({
    totalEarned: 0,
    totalWithdrawn: 0,
    currentBalance: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user stats from the blockchain
  useEffect(() => {
    const fetchUserStats = async () => {
      if (address) {
        try {
          const stats = await readContract(config, {
            address: questifyAddress,
            abi: questifyABI,
            functionName: "getUserStats",
            args: [address],
          });
          setUserStats({
            totalEarned: Number((stats as [number, number, number])[0]),
            totalWithdrawn: Number((stats as [number, number, number])[1]),
            currentBalance: Number((stats as [number, number, number])[2]),
          });
        } catch (error) {
          console.error("Error fetching user stats:", error);
        }
      }
    };

    fetchUserStats();
  }, [address]);

  // Handle withdrawing tokens
  const handleWithdraw = async () => {
    if (!address) {
      toast.error("Please connect your wallet to withdraw tokens");
      return;
    }

    setIsLoading(true);
    try {
      await writeContract(config, {
        address: questifyAddress,
        abi: questifyABI,
        functionName: "withdrawTokens",
      });
      toast.success("Tokens withdrawn successfully");
    } catch (error) {
      console.error("Withdrawal failed:", error);
      toast.error("Failed to withdraw tokens");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Hamburger Button */}
        <button className="lg:hidden p-2" onClick={() => setIsNavOpen(true)}>
          <img src={bars} alt="Menu" className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center">
            <span className="questify-logo text-2xl font-bold text-gray-800 ml-2">
              Questify
            </span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {/* Token Balance and Withdraw Button */}
          {address && (
            <div className="hidden lg:flex items-center space-x-4">
              <div className="bg-gray-50 p-2 rounded-lg">
                <p className="text-sm text-gray-700">
                  Balance: {userStats.currentBalance} tokens
                </p>
              </div>
              <button
                onClick={handleWithdraw}
                disabled={isLoading || userStats.currentBalance === 0}
                className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 ${
                  isLoading || userStats.currentBalance === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {isLoading ? "Withdrawing..." : "Withdraw"}
              </button>
            </div>
          )}
          <div className="flex bg-slate-50 rounded-full">
            <appkit-button />
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isNavOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50">
          <div className="absolute top-0 left-0 w-4/5 bg-white h-full shadow-lg rounded-r-lg p-6 flex flex-col">
            {/* Close Button */}
            <button
              className="self-end text-gray-600 hover:text-black mb-6"
              onClick={() => setIsNavOpen(false)}
            >
              <IoClose className="w-6 h-6" />
            </button>

            {/* Links */}
            <div className="flex flex-col space-y-6">
              <Link
                to="/"
                className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition duration-300"
                onClick={() => setIsNavOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/Questions"
                className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition duration-300"
                onClick={() => setIsNavOpen(false)}
              >
                Questions
              </Link>
              <Link
                to="/Tags"
                className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition duration-300"
                onClick={() => setIsNavOpen(false)}
              >
                Tags
              </Link>
              <Link
                to="/Users"
                className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition duration-300"
                onClick={() => setIsNavOpen(false)}
              >
                Users
              </Link>
            </div>

            {/* Token Balance and Withdraw Button for Mobile */}
            {address && (
              <div className="mt-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    Balance: {userStats.currentBalance} tokens
                  </p>
                  <button
                    onClick={handleWithdraw}
                    disabled={isLoading || userStats.currentBalance === 0}
                    className={`w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 ${
                      isLoading || userStats.currentBalance === 0
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {isLoading ? "Withdrawing..." : "Withdraw"}
                  </button>
                </div>
              </div>
            )}

            {/* Add some extra padding or space at the bottom for better spacing */}
            <div className="flex-grow" />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
