import { ImSpinner2 } from "react-icons/im";

const TestLoadingScreen = () => {
    return (
        <div className="fixed inset-0 bg-white z-[300] flex items-center justify-center">
            <div className="flex flex-col items-center gap-5">
                <ImSpinner2 size={40} className="animate-spin text-gray-700" />
                <h2 className="text-xl font-semibold text-gray-800">Your test will begin shortly</h2>
                <p className="text-sm text-gray-500">Please wait</p>
            </div>
        </div>
    );
};

export default TestLoadingScreen;
