import { SIZE_LABELS } from '../designTokens';

function InspectorField({ control, value, onChange }) {
  const id = `inspector-${control.name}`;

  if (control.type === 'segmented') {
    return (
      <div className="panel__inspector-field">
        <label>{control.label}</label>
        <div className="panel__segmented-control">
          {control.options.map((option) => (
            <button
              key={option}
              type="button"
              className={value === option ? 'panel__segmented-control-button panel__segmented-control-button--active' : 'panel__segmented-control-button'}
              onClick={() => onChange(control.name, option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (control.type === 'select') {
    return (
      <div className="panel__inspector-field">
        <label htmlFor={id}>{control.label}</label>
        <select id={id} value={value ?? ''} onChange={(event) => onChange(control.name, event.target.value)}>
          {control.options.map((option) => (
            <option key={option} value={option}>
              {SIZE_LABELS[option] || option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (control.type === 'textarea') {
    return (
      <div className="panel__inspector-field">
        <label htmlFor={id}>{control.label}</label>
        <textarea id={id} rows="4" value={value ?? ''} onChange={(event) => onChange(control.name, event.target.value)} />
      </div>
    );
  }

  return (
    <div className="panel__inspector-field">
      <label htmlFor={id}>{control.label}</label>
      <input
        id={id}
        type={control.type}
        value={value ?? ''}
        onChange={(event) => onChange(control.name, event.target.value)}
      />
    </div>
  );
}

export function EditorInspector({ block, definition, onChange, onDelete }) {
  return (
    <aside className="panel panel--inspector">
      {!block || !definition ? (
        <div className="panel__empty-state panel__empty-state--sidebar">
          <p>Select a block to edit its email-oriented properties.</p>
        </div>
      ) : (
        <div className="panel__inspector">
          <div className="panel__inspector-summary">
            <span className="panel__inspector-type">{definition.category}</span>
            <h3>{definition.label}</h3>
          </div>

          <div className="panel__inspector-actions">
            <button type="button" className="panel__button panel__button--danger" onClick={onDelete}>Delete</button>
          </div>

          <div className="panel__inspector-fields">
            {definition.controls.length ? (
              definition.controls.map((control) => (
                <InspectorField
                  key={control.name}
                  control={control}
                  value={block.props?.[control.name]}
                  onChange={onChange}
                />
              ))
            ) : (
              <p className="panel__inspector-note">This structural block has no direct editable properties.</p>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
