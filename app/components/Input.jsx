import React from "react";

const Input = ({
  label,
  id,
  extra,
  type,
  value,
  hint,
  disabled,
  handler,
  min,
  max,
  classes,
  state,
}) => {
  return (
    <div className={`${extra}`}>
      <label htmlFor={id} className={`text-sm text-navy-700`}>
        {label}
      </label>
      <input
        onChange={handler}
        disabled={disabled}
        type={type}
        id={id}
        name={id}
        min={min}
        max={max}
        value={value}
        placeholder={hint}
        className={` mt-2 flex h-12 w-full items-center justify-center rounded-xl border bg-white/0 p-3 text-sm outline-none transition-all duration-200 focus:border-blue-400 ${
          disabled === true
            ? "!border-none !bg-gray-100 dark:!bg-white/5 dark:placeholder:!text-[rgba(255,255,255,0.15)]"
            : ""
        } border-gray-200 ${classes}`}
      />
    </div>
  );
};

export default Input;
