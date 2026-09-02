type Props = { visible: boolean };

export function LoadingOverlay({ visible }: Props) {
  if (!visible) return null;
  return (
    <div className="lab-loading" role="status">
      Preparing laboratory
    </div>
  );
}
