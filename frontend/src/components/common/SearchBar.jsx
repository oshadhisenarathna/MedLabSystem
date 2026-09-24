export default function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`input-group ${className}`} style={{maxWidth:280}}>
      <span className="input-group-text bg-white border-end-0 text-muted" style={{borderColor:'#e2e8f0',borderRadius:'8px 0 0 8px'}}>
        <i className="bi bi-search" style={{fontSize:13}} />
      </span>
      <input
        type="text"
        className="form-control border-start-0 ps-1"
        style={{borderRadius:'0 8px 8px 0'}}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      {value && (
        <button className="btn btn-link text-muted p-0 pe-2 position-absolute end-0 top-50 translate-middle-y"
          style={{zIndex:5}} onClick={() => onChange('')} type="button">
          <i className="bi bi-x" />
        </button>
      )}
    </div>
  );
}
