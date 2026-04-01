import { useId, useState } from "react"

const EyeIcon = ({ open }) => {
  if (open) {
    return (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }

  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3l18 18" />
      <path d="M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.42-1.24" />
      <path d="M9.88 5.27A10.43 10.43 0 0 1 12 5c7 0 11 7 11 7a18.5 18.5 0 0 1-3.05 4.28" />
      <path d="M6.11 6.11C3.5 8 1 12 1 12s4 7 11 7c1.31 0 2.54-.23 3.65-.63" />
    </svg>
  )
}

export default function PasswordInput({
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error = "",
  autoComplete = "current-password",
  containerClassName = "",
}) {
  const reactId = useId()
  const inputId = id || `${name || "password"}-${reactId}`
  const [show, setShow] = useState(false)

  const errorId = error ? `${inputId}-error` : undefined

  return (
    <div className={`relative ${containerClassName}`}>
      <input
        id={inputId}
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={errorId}
        className={`input-field pr-12 ${error ? "border-red-500" : ""}`}
        placeholder={placeholder}
      />

      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <EyeIcon open={show} />
      </button>

      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

