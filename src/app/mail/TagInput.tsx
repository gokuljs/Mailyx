import useThreads from "@/hooks/useThreads";
import { api } from "@/trpc/react";
import React, { useState } from "react";
import Avatar from "react-avatar";
import Select from "react-select";

type Props = {
  placeholder: string;
  label: string;
  onChange: (value: { label: string; value: string }[]) => void;
  value: { label: string; value: string }[];
};

const TagInput = ({ label, placeholder, onChange, value }: Props) => {
  const { accountId } = useThreads();
  const [inputValue, setInputValue] = useState("");
  const { data: suggestions } = api.account.getSuggestions.useQuery({
    accountId,
  });
  const options = suggestions?.map((item) => ({
    label: (
      <span className="text-muted-foreground flex items-center gap-2">
        <Avatar name={item?.address} size="25" textSizeRatio={2} round={true} />
        {item?.address}
      </span>
    ),
    value: item?.address,
  }));
  return (
    <div className="items flex items-center gap-2 rounded-md border">
      <span className="text-muted-foreground ml-3 text-sm">{label}</span>
      <Select
        onInputChange={setInputValue}
        value={value}
        // @ts-ignore
        onChange={onChange}
        className="w-full flex-1"
        // @ts-ignore
        options={
          inputValue
            ? options?.concat({
                // @ts-ignore
                label: inputValue,
                value: inputValue,
              })
            : options
        }
        placeholder={placeholder}
        isMulti
        classNames={{
          menu: () => {
            return "bg-background border-border !text-foreground !border";
          },
          option: ({ isFocused }) => {
            return `${isFocused ? "!bg-accent !text-accent-foreground" : ""} hover:!bg-accent !text-foreground !cursor-pointer`;
          },
          control: () => {
            return "!border-none !outline-none !ring-0 !shadow-none focus:border-none focus:outline-none focus:ring-0 focus:shadow-none !bg-transparent";
          },
          input: () => "!text-foreground",
          multiValue: () => "!bg-secondary !rounded-md flex items-center",
          multiValueLabel: () => "!text-secondary-foreground px-2",
          multiValueRemove: () =>
            "!text-secondary-foreground px-2 hover:!bg-destructive hover:!text-destructive-foreground !rounded-r-lg",
        }}
      />
    </div>
  );
};

export default TagInput;
