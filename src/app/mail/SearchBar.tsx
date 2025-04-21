"use client";
import { Input } from "@/components/ui/input";
import useThreads from "@/hooks/useThreads";
import { atom, useAtom } from "jotai";
import { Loader2, Search, X } from "lucide-react";
import React from "react";

export const searchValueAtom = atom("");
export const isSearchingAtom = atom(false);

const SearchBar = () => {
  const [searchValue, setSearchValue] = useAtom(searchValueAtom);
  const [isSearching, setIsSearching] = useAtom(isSearchingAtom);
  const { isFetching } = useThreads();
  const handleBlur = () => {
    if (searchValue !== "") return;
    setIsSearching(false);
  };
  return (
    <div className="relative flex items-center p-4">
      <Search className="absolute top-6.5 left-6 size-4 text-orange-400" />
      <Input
        placeholder="Search..."
        className="pl-8"
        value={searchValue}
        onFocus={() => {
          setIsSearching(true);
        }}
        onBlur={handleBlur}
        onChange={(e) => setSearchValue(e.target.value)}
      />

      <div className="absolute top-5.5 right-6 flex items-center gap-2">
        {isFetching && (
          <Loader2 className="size-4 animate-spin text-orange-400" />
        )}
        <button className="rounded-sm p-1 hover:bg-gray-400/20">
          <X
            onClick={() => {
              setSearchValue("");
              setIsSearching(false);
            }}
            className="size-4 text-gray-400"
          />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
