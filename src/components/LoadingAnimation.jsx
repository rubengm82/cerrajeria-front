function LoadingAnimation({ heightClass = "h-[calc(100vh-200px)]" }) {
  return (
    <div className={`flex items-center justify-center ${heightClass} w-full`}>
      <span className="loading loading-ring loading-xl text-primary w-16"></span>
    </div>
  );
}

export default LoadingAnimation;
