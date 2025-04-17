import React from "react";
import EmailEditor from "./EmailEditor";

type Props = {};

const ReplyBox = (props: Props) => {
  return (
    <div className="flex-1 px-4 py-1 pt-4">
      <EmailEditor />
    </div>
  );
};

export default ReplyBox;
