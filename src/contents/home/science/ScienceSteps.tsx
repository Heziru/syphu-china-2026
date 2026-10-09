const steps = [
  { label: "Colon", target: 0.449, anchor: "home-colon" },
  { label: "Surface", target: 0.5, anchor: "home-surface" },
  { label: "Response", target: 0.588, anchor: "home-signal" },
];

export function ScienceSteps({ active, onNavigate }: {
  active: number;
  onNavigate?: (progress: number) => void;
}) {
  return <nav className="scienceSteps" aria-label="Within the gut">
    {steps.map((step, index) => onNavigate
      ? <button key={step.label} type="button" aria-label={step.label} aria-current={index === active ? "step" : undefined}
          onClick={() => onNavigate(step.target)}>{step.label}</button>
      : <a key={step.label} aria-label={step.label} href={`#${step.anchor}`} aria-current={index === active ? "step" : undefined}>{step.label}</a>)}
  </nav>;
}
