export default function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="pageHeader">
      <div>
        {eyebrow && <p className="pageEyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {subtitle && <p className="pageSubtitle">{subtitle}</p>}
      </div>

      {actions && <div className="pageActions">{actions}</div>}

      <style jsx>{`
        .pageHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 22px;
        }

        .pageEyebrow {
          margin: 0 0 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6b7280;
        }

        h1 {
          margin: 0;
          font-size: 34px;
          font-weight: 750;
          letter-spacing: -0.04em;
          line-height: 1;
          color: #111827;
        }

        .pageSubtitle {
          margin: 8px 0 0;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.5;
          color: #6b7280;
        }

        .pageActions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        @media (max-width: 760px) {
          .pageHeader {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
