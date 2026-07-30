interface SpinnerProps {
  label?: string
}

export default function Spinner({ label = '読み込み中…' }: SpinnerProps) {
  return <p className="muted">{label}</p>
}
