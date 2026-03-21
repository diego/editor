import { SIZE_LABELS } from '../designTokens';
import { EditorIcon } from './EditorIcon';

function getOptionValue(option) {
  return typeof option === 'string' ? option : option.value;
}

function getOptionLabel(option) {
  if (typeof option === 'string') {
    return SIZE_LABELS[option] || option;
  }

  return option.label;
}

function InspectorField({ control, value, onChange }) {
  const id = `inspector-${control.name}`;

  if (control.type === 'segmented') {
    return (
      <div className="panel__inspector-field">
        <label>{control.label}</label>
        <div className="panel__segmented-control">
          {control.options.map((option) => (
            <button
              key={getOptionValue(option)}
              type="button"
              className={value === getOptionValue(option) ? 'panel__segmented-control-button panel__segmented-control-button--active' : 'panel__segmented-control-button'}
              onClick={() => onChange(control.name, getOptionValue(option))}
            >
              {getOptionLabel(option)}
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
            <option key={getOptionValue(option)} value={getOptionValue(option)}>
              {getOptionLabel(option)}
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

export function EditorInspector({
  block,
  definition,
  onChange,
  onDelete,
}) {
  const controlGroups = definition?.controlGroups?.filter((group) => group.controls.length) || [];

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

          <div className="panel__inspector-fields">
            {controlGroups.length ? (
              controlGroups.map((group) => (
                <section key={group.name} className="panel__inspector-group">
                  <h4 className="panel__inspector-group-title">{group.label}</h4>
                  <div className="panel__inspector-group-fields">
                    {group.controls.map((control) => (
                      <InspectorField
                        key={control.name}
                        control={control}
                        value={block.props?.[control.name]}
                        onChange={onChange}
                      />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <p className="panel__inspector-note">This structural block has no direct editable properties.</p>
            )}
          </div>

          <div className="panel__inspector-actions">
            <button type="button" className="panel__button panel__button--danger" onClick={onDelete}>
              <EditorIcon name="delete" className="panel__button-icon" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
