import React, { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Feather, PencilIcon } from "lucide-react";
import EmailEditor from "./EmailEditor";
import { api } from "@/trpc/react";
import useThreads from "@/hooks/useThreads";
import { error } from "console";
import { toast } from "sonner";

type Props = {};

const ComposeButton = (props: Props) => {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [toValues, setToValues] = useState<{ label: string; value: string }[]>(
    [],
  );
  const [ccValue, setCCValues] = useState<{ label: string; value: string }[]>(
    [],
  );
  const sendEmail = api.account.sendEmail.useMutation();
  const { account } = useThreads();

  const handleSend = (value: string) => {
    console.log("handle send");
    if (!account) return;
    sendEmail.mutate(
      {
        accountId: account.id,
        threadId: undefined,
        body: value,
        from: { name: account?.name || "", address: account?.emailAddress },
        to: toValues?.map((item) => ({
          name: item?.value,
          address: item?.value,
        })),
        cc: ccValue?.map((item) => ({
          name: item?.value,
          address: item?.value,
        })),
        replyTo: {
          name: account?.name,
          address: account?.emailAddress ?? "me@example.com",
        },
        subject: subject,
        inReplyTo: undefined,
      },
      {
        onSuccess: () => {
          toast.success("Email sent");
          setOpen(false);
        },
        onError: (error) => {
          console.log(error);
          toast.error("Error sending email ");
        },
      },
    );
  };
  return (
    <Drawer
      open={open}
      onOpenChange={() => {
        setOpen(false);
      }}
    >
      <Button className="cursor-pointer" onClick={() => setOpen(true)}>
        <Feather />
        Compose
      </Button>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Compose Email</DrawerTitle>
        </DrawerHeader>
        <EmailEditor
          subject={subject}
          toValues={toValues}
          setToValues={setToValues}
          setSubject={setSubject}
          ccValues={ccValue}
          to={toValues?.map((item) => item?.value)}
          defaultToolbarExpanded={true}
          setCCValues={setCCValues}
          handleSend={handleSend}
          isSending={false}
        />
      </DrawerContent>
    </Drawer>
  );
};

export default ComposeButton;
