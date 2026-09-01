import { Suspense } from 'react';
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useParams,
} from 'react-router-dom';
import { findLab, labs } from './labs/registry';

function LabIndex() {
  return (
    <div className="page">
      <h1>react-perf-lab</h1>
      <p className="lead">
        Udemy講座「Reactパフォーマンスチューニング」の教材です。
      </p>

      <ul className="lab-list">
        {labs.map((lab) => (
          <li key={lab.id} className="lab-card">
            <div className="lab-card__head">
              <span className="badge">{lab.section}</span>
              <h2>{lab.title}</h2>
            </div>
            <p className="lab-card__summary">{lab.summary}</p>
            <p className="lab-card__path">
              <code>src/labs/{lab.id}/</code>
            </p>
            <div className="lab-card__variants">
              {lab.variants.map((variant) =>
                variant.load ? (
                  <Link
                    key={variant.id}
                    className="button"
                    to={`/labs/${lab.id}/${variant.id}`}
                  >
                    {variant.label}
                  </Link>
                ) : (
                  <span key={variant.id} className="button button--disabled">
                    {variant.label}（未実装）
                  </span>
                ),
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LabHost() {
  const { labId, variantId } = useParams();
  const lab = findLab(labId);
  const variant = lab?.variants.find((v) => v.id === variantId);

  if (!lab || !variant) {
    return (
      <div className="page">
        <h1>ラボが見つかりません</h1>
        <Link to="/">一覧へ戻る</Link>
      </div>
    );
  }

  if (!variant.load) {
    return (
      <div className="page">
        <h1>{lab.title}</h1>
        <p>このバリアント（{variant.label}）はまだ実装されていません。</p>
        <Link to="/">一覧へ戻る</Link>
      </div>
    );
  }

  const Component = variant.load;

  return (
    <div className="lab-host">
      <header className="lab-bar">
        <Link to="/" className="lab-bar__home">
          ← ラボ一覧
        </Link>
        <span className="lab-bar__title">
          {lab.section} / {lab.title}
        </span>
        <nav className="lab-bar__variants">
          {lab.variants.map((v) =>
            v.load ? (
              <Link
                key={v.id}
                to={`/labs/${lab.id}/${v.id}`}
                className={v.id === variant.id ? 'chip chip--active' : 'chip'}
              >
                {v.label}
              </Link>
            ) : null,
          )}
        </nav>
      </header>

      <Suspense fallback={<div className="page">読み込み中…</div>}>
        <Component />
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LabIndex />} />
        <Route path="/labs/:labId/:variantId/*" element={<LabHost />} />
        <Route
          path="*"
          element={
            <div className="page">
              <h1>404</h1>
              <Link to="/">一覧へ戻る</Link>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
