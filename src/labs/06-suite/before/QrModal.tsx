import { renderQrSvg } from '../../../vendor/shiba-qr'

interface QrModalProps {
  url: string
  onClose: () => void
}

export default function QrModal({ url, onClose }: QrModalProps) {
  const svg = renderQrSvg(url, { scale: 5 })

  return (
    <div
      role="dialog"
      aria-label="共有用QRコード"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(23, 43, 77, 0.45)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 10,
      }}
      onClick={onClose}
    >
      <div className="panel" style={{ minWidth: 280 }} onClick={(event) => event.stopPropagation()}>
        <h3>この画面を共有</h3>
        <div dangerouslySetInnerHTML={{ __html: svg }} />
        <p className="muted" style={{ margin: '8px 0', wordBreak: 'break-all', fontSize: 12 }}>
          {url}
        </p>
        <button className="button" onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>
  )
}
