export default function StarRating({ value, onChange, label }) {
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
      <span style={{ fontSize: '13px', color: '#6b6860', flex: 1 }}>{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0 1px',
              fontSize: '18px',
              color: star <= value ? '#a07840' : '#d4cfc8',
              lineHeight: 1,
            }}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  )
}
