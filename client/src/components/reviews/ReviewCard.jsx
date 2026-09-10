'use client';

export default function ReviewCard({ review }) {
  const { user, rating, title, comment, isVerified, createdAt } = review;
  
  const firstName = user?.firstName || 'Anonymous';
  const lastName = user?.lastName || '';
  const initials = `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ''}`;
  
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const renderStars = (rating) => {
    return (
      <div className="flex items-center text-yellow-400 text-sm">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < rating ? '' : 'text-white/10'}>★</span>
        ))}
      </div>
    );
  };

  return (
    <div className="glass rounded-xl p-5 border border-white/5">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold text-sm">
            {initials.toUpperCase()}
          </div>
          <div>
            <div className="text-white font-medium text-sm flex items-center gap-2">
              {firstName} {lastName}
              {isVerified && (
                <span className="flex items-center gap-1 text-accent text-[10px] uppercase tracking-wider bg-accent/10 px-1.5 py-0.5 rounded">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Verified
                </span>
              )}
            </div>
            <div className="mt-1">
              {renderStars(rating)}
            </div>
          </div>
        </div>
        <span className="text-white/30 text-xs">{formattedDate}</span>
      </div>
      
      {title && <h4 className="font-semibold text-white mb-2">{title}</h4>}
      <p className="text-white/60 text-sm leading-relaxed">{comment}</p>
    </div>
  );
}
