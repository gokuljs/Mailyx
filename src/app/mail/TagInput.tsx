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
      <span className="ml-3 text-sm text-orange-500">{label}</span>
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
            return "dark:!bg-[hsl(20_14.3%_4.1%)] !border !border-muted ";
          },
          option: ({ isFocused }) => {
            return `${isFocused ? "!bg-muted text-white" : ""} hover:!bg-muted text-white !cursor-pointer`;
          },
          control: () => {
            return "!border-none !outline-none !ring-0 !shadow-none focus:border-none focus:outline-none focus:ring-0 focus:shadow-none !bg-transparent !dark:bg-transparent";
          },
          multiValue: () => {
            return "dark:!bg-gray-700";
          },
          input: () => "!text-muted-foreground",
          multiValueLabel: () => {
            return "dark:text-white dark:bg-gray-700 rounded-md";
          },
        }}
      />
    </div>
  );
};

export default TagInput;
