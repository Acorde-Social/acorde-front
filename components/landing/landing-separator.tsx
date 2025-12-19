export function LandingSeparator() {
  return (
    <div className="relative h-24 overflow-hidden bg-background">
      <div className="absolute -top-12 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-background" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <svg 
          className="w-full h-12 text-primary/10" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 C200,20 400,100 600,40 C800,-20 1000,80 1200,40"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="10,5"
          />
        </svg>
      </div>
    </div>
  )
}