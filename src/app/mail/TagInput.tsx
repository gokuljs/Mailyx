import React from "react";
import Select from "react-select";

type Props = {
  defaultValue: {
    label: string;
    value: string;
  }[];
  placeholder: string;
  label: string;
  onChange: (value: { label: string; value: string }) => void;
  value: { label: string; value: string }[];
};

const TagInput = ({
  defaultValue,
  label,
  placeholder,
  onChange,
  value,
}: Props) => {
  return (
    <div className="items flex items-center rounded-md border">
      <span className="ml-3 text-sm text-gray-500">{label}</span>
      <Select
        value={value}
        // @ts-ignore
        onChange={onChange}
        placeholder={placeholder}
        isMulti
      />
    </div>
  );
};

export default TagInput;
