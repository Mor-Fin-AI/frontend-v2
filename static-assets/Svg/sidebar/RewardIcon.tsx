export const RewardIcon = ({ size = 20, className }: { size?: number; className?: string }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M15.833 15.4655L18.0292 8.09547C18.1378 7.73331 17.7467 7.42531 17.4201 7.61583L15.7435 8.59388C14.4571 9.34421 12.8041 8.81063 12.1993 7.44977L10.3802 3.35682C10.2335 3.02689 9.76526 3.02689 9.61867 3.35682L7.79957 7.44977C7.19475 8.81063 5.54172 9.34421 4.25536 8.59388L2.57873 7.61583C2.25212 7.42531 1.86104 7.7333 1.96969 8.09547L4.16608 15.4667"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.8337 15.4166C15.8337 16.107 13.222 16.6666 10.0003 16.6666C6.77867 16.6666 4.16699 16.107 4.16699 15.4166C4.16699 14.7263 6.77867 14.1666 10.0003 14.1666C13.222 14.1666 15.8337 14.7263 15.8337 15.4166Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
};
