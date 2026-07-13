import React from "react";

const FormInput = ({ label, error, register, name, type = "text", placeholder, ...rest }) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-text">
          {label}
        </label>
      )}
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/20 ${
          error ? "border-danger" : "border-border"
        }`}
        {...register(name)}
        {...rest}
      />
      {error && <p className="text-xs text-danger">{error.message}</p>}
    </div>
  );
};

export default FormInput;
