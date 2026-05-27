export function LandingBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.06]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="bg-triangles"
            x="0"
            y="0"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <polygon
              points="40,8 60,72 20,72"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <polygon
              points="0,8 20,72 -20,72"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <polygon
              points="80,8 100,72 60,72"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg-triangles)" />
      </svg>

      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[var(--accent)]/[0.03] to-transparent" />

      <DecorChecker
        className="-top-16 -left-16 w-72 h-72 text-[var(--checker-white)] rotate-12 opacity-[0.07]"
      />
      <DecorChecker
        className="-bottom-24 -right-20 w-96 h-96 text-[var(--checker-black)] -rotate-6 opacity-[0.10]"
      />
      <DecorChecker
        className="top-1/3 right-1/4 w-32 h-32 text-[var(--accent)] rotate-45 opacity-[0.06] hidden lg:block"
      />

      <DecorDie
        className="top-12 right-12 w-24 h-24 text-[var(--foreground)] opacity-[0.08] -rotate-12"
        face={5}
      />
      <DecorDie
        className="bottom-16 left-1/4 w-20 h-20 text-[var(--foreground)] opacity-[0.06] rotate-12"
        face={3}
      />
      <DecorDie
        className="top-1/2 left-12 w-16 h-16 text-[var(--foreground)] opacity-[0.05] rotate-6 hidden md:block"
        face={6}
      />

      <DecorBoardArc className="bottom-0 left-0 w-full h-32 opacity-[0.04] text-[var(--accent)]" />
    </div>
  );
}

function DecorChecker({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`absolute ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="46" fill="currentColor" />
      <circle
        cx="50"
        cy="50"
        r="38"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="2"
      />
      <circle
        cx="50"
        cy="50"
        r="30"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="1.5"
      />
    </svg>
  );
}

const DOTS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [25, 50], [25, 75], [75, 25], [75, 50], [75, 75]],
};

function DecorDie({ className, face }: { className: string; face: number }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`absolute ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="5"
        y="5"
        width="90"
        height="90"
        rx="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      {DOTS[face].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="6" fill="currentColor" />
      ))}
    </svg>
  );
}

function DecorBoardArc({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 1200 100"
      preserveAspectRatio="none"
      className={`absolute ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <polygon
          key={i}
          points={`${i * 100 + 10},100 ${i * 100 + 50},10 ${i * 100 + 90},100`}
          fill="currentColor"
          opacity={i % 2 === 0 ? 0.4 : 0.8}
        />
      ))}
    </svg>
  );
}
