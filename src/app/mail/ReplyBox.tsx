import React, { useEffect, useState } from "react";
import EmailEditor from "./EmailEditor";
import { api, RouterOutputs } from "@/trpc/react";
import useThreads from "@/hooks/useThreads";
import { toast } from "sonner";

type Props = {};

const ReplyBox = (props: Props) => {
  const { accountId, threadId } = useThreads();
  const { data } = api.account.getReplyDetails.useQuery({
    accountId,
    threadId: threadId ?? "",
  });
  if (!data) return <></>;
  return <Component data={data} />;
};

const Component = ({
  data,
}: {
  data: RouterOutputs["account"]["getReplyDetails"];
}) => {
  const { accountId, threadId } = useThreads();
  const [subject, setSubject] = useState(
    data?.subject?.startsWith("Re:") ? data?.subject : `Re: ${data?.subject}`,
  );
  const [toValues, setToValues] = useState<{ label: string; value: string }[]>(
    data?.to?.map((item) => ({
      label: item?.address,
      value: item?.address,
    })),
  );
  const [ccValue, setCCValues] = useState<{ label: string; value: string }[]>(
    data?.cc?.map((item) => ({
      label: item?.address,
      value: item?.address,
    })),
  );

  useEffect(() => {
    if (!threadId || !data) return;
    setSubject(
      data?.subject?.startsWith("Re:") ? data?.subject : `Re: ${data?.subject}`,
    );
    setToValues(
      data?.to?.map((item) => ({
        label: item?.address,
        value: item?.address,
      })),
    );
    setCCValues(
      data?.cc?.map((item) => ({
        label: item?.address,
        value: item?.address,
      })),
    );
  }, [threadId, data]);

  const sendEmail = api.account.sendEmail.useMutation();

  const handleSend = async (value: string) => {
    console.log("handle send");
    if (!data) return;
    sendEmail.mutate(
      {
        accountId,
        threadId: threadId ?? undefined,
        body: value,
        subject: subject,
        from: data?.from,
        to: data?.to?.map((item) => ({
          address: item.address,
          name: item?.name || "",
        })),
        cc: data?.cc?.map((item) => ({
          address: item.address,
          name: item?.name || "",
        })),
        replyTo: data?.from,
        inReplyTo: data?.id,
      },
      {
        onSuccess: () => {
          toast.success("Email sent SuccessFully");
        },
        onError: (error) => {
          console.log(error);
          toast.error("Error Sending email ");
        },
      },
    );
  };
  return (
    <EmailEditor
      subject={subject}
      toValues={toValues}
      setToValues={setToValues}
      setSubject={setSubject}
      ccValues={ccValue}
      setCCValues={setCCValues}
      to={data?.to?.map((item) => item?.address)}
      handleSend={handleSend}
      isSending={false}
    />
  );
};

export default ReplyBox;
