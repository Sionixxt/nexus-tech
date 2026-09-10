'use client';

export default function CheckoutSteps({ currentStep = 1, steps = ['Shipping Info', 'Delivery', 'Payment'] }) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative max-w-3xl mx-auto">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div key={step} className="flex flex-col items-center relative z-10 w-1/3">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-primary-500 text-white' 
                    : isCurrent 
                      ? 'bg-primary-500 text-white ring-4 ring-primary-500/20' 
                      : 'bg-white/10 text-white/40'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              <span 
                className={`mt-3 text-xs sm:text-sm font-medium text-center ${
                  isCurrent || isCompleted ? 'text-white' : 'text-white/40'
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}

        {/* Connecting Lines */}
        <div className="absolute top-5 left-[16.66%] right-[16.66%] h-0.5 z-0 flex">
          {[...Array(steps.length - 1)].map((_, index) => {
            const isCompletedLine = index + 1 < currentStep;
            return (
              <div 
                key={index}
                className={`h-full w-1/2 transition-colors duration-300 ${
                  isCompletedLine ? 'bg-primary-500' : 'bg-white/10'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { CheckoutSteps };
